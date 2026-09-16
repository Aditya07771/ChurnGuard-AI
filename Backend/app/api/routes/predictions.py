from __future__ import annotations
import io
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile
from fastapi.responses import FileResponse
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.database.repository import add_prediction, count_predictions, get_prediction, list_predictions
from app.ml.predictor import risk_category
from app.schemas.customer import CustomerFeatures
from app.services.prediction_service import predict_and_save
from app.utils.data_validation import FEATURE_COLUMNS, feature_frame
from app.schemas.prediction import PredictionResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.post("", response_model=PredictionResponse)
def create_prediction(request: Request, customer: CustomerFeatures, db: Session = Depends(get_db)):
    return predict_and_save(request, customer.model_dump(), db)

@router.post("/batch")
async def batch_predictions(request: Request, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Validate rows first, score valid customers together, and save one DB transaction."""
    settings = request.app.state.settings
    filename = (file.filename or "").lower()
    if not filename.endswith(".csv"):
        raise HTTPException(status_code=415, detail={"code": "INVALID_FILE_TYPE", "message": "Upload a .csv file."})
    content = await file.read(settings.max_upload_size_mb * 1024 * 1024 + 1)
    if len(content) > settings.max_upload_size_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail={"code": "FILE_TOO_LARGE", "message": f"Maximum upload size is {settings.max_upload_size_mb} MB."})
    if not content.strip():
        raise HTTPException(status_code=400, detail={"code": "EMPTY_FILE", "message": "The uploaded CSV is empty."})
    try:
        frame = pd.read_csv(io.BytesIO(content))
    except Exception as exc:
        raise HTTPException(status_code=400, detail={"code": "INVALID_CSV", "message": "Could not parse the uploaded CSV."}) from exc
    if frame.empty:
        raise HTTPException(status_code=400, detail={"code": "EMPTY_CSV", "message": "The CSV has a header but no rows."})
    if len(frame) > settings.max_batch_rows:
        raise HTTPException(status_code=413, detail={"code": "TOO_MANY_ROWS", "message": f"Upload at most {settings.max_batch_rows} rows per batch."})
    missing = [column for column in FEATURE_COLUMNS if column not in frame.columns]
    if missing:
        raise HTTPException(status_code=422, detail={"code": "MISSING_COLUMNS", "message": "CSV is missing required feature columns.", "columns": missing})
    registry = request.app.state.model_registry
    if not registry.available:
        raise HTTPException(status_code=503, detail={"code": "MODEL_UNAVAILABLE", "message": registry.error})

    target_ignored = "Churn" in frame.columns
    batch_id = str(uuid.uuid4())
    errors, valid_rows = [], []

    # Validation is done row-by-row so one malformed row does not discard the full upload.
    for index, row in frame.iterrows():
        source_row = int(index) + 2  # First data row is line 2 because line 1 is the CSV header.
        customer_id = None
        if "customerID" in frame.columns and pd.notna(row.get("customerID")):
            customer_id = str(row.get("customerID")).strip() or None
        profile = {}
        try:
            for column in FEATURE_COLUMNS:
                value = row[column]
                if pd.isna(value) or (isinstance(value, str) and not value.strip()):
                    if column == "TotalCharges":
                        profile[column] = None
                        continue
                    raise ValueError(f"{column} is blank")
                if column in {"SeniorCitizen", "tenure"}:
                    numeric = float(value)
                    if not numeric.is_integer():
                        raise ValueError(f"{column} must be a whole number")
                    profile[column] = int(numeric)
                elif column in {"MonthlyCharges", "TotalCharges"}:
                    profile[column] = float(value)
                else:
                    profile[column] = str(value).strip()
            validated = CustomerFeatures.model_validate(profile).model_dump()
            valid_rows.append({"source_row": source_row, "customerID": customer_id, "profile": validated})
        except (ValueError, ValidationError, TypeError) as exc:
            message = str(exc)
            if isinstance(exc, ValidationError):
                message = "; ".join(
                    f"{'.'.join(str(part) for part in error['loc'])}: {error['msg']}"
                    for error in exc.errors()
                )
            errors.append({"source_row": source_row, "customerID": customer_id, "error": message})

    output_rows = []
    if valid_rows:
        try:
            profiles = [row["profile"] for row in valid_rows]
            feature_data = pd.DataFrame(profiles, columns=FEATURE_COLUMNS)
            probabilities = registry.churn_probabilities(feature_frame(feature_data))
            prediction_records = []
            results = []
            for row, probability in zip(valid_rows, probabilities):
                probability = float(probability)
                result = {
                    "churn_probability": probability,
                    "predicted_churn": "Yes" if probability >= settings.prediction_threshold else "No",
                    "risk_category": risk_category(probability, settings),
                    "model_version": registry.metadata.get("model_version"),
                    "explanation": {"status": "not_requested", "method": None, "top_features": []},
                }
                record = add_prediction(db, row["profile"], result, customer_id=row["customerID"])
                prediction_records.append(record)
                results.append(result)
            db.commit()
            for record in prediction_records:
                db.refresh(record)
            for row, result, record in zip(valid_rows, results, prediction_records):
                output_rows.append({
                    "source_row": row["source_row"], "customerID": row["customerID"], **row["profile"],
                    "churn_probability": result["churn_probability"], "predicted_churn": result["predicted_churn"],
                    "risk_category": result["risk_category"], "model_version": result["model_version"],
                    "prediction_id": record.id,
                })
        except Exception as exc:
            db.rollback()
            logger.exception("Batch prediction or persistence failed.")
            raise HTTPException(status_code=500, detail={
                "code": "BATCH_PROCESSING_FAILED",
                "message": "The batch could not be completed. No successful rows were committed; inspect server logs for details.",
            }) from exc

    if output_rows:
        export_dir = settings.processed_data_dir / "batch_exports"
        export_dir.mkdir(parents=True, exist_ok=True)
        export_path = export_dir / f"{batch_id}.csv"
        pd.DataFrame(output_rows).to_csv(export_path, index=False)
    return {
        "batch_id": batch_id,
        "total_rows": int(len(frame)),
        "successful_rows": len(output_rows),
        "failed_rows": len(errors),
        "target_column_ignored": target_ignored,
        "results": output_rows,
        "errors": errors,
        "download_url": f"{settings.api_v1_prefix}/predictions/batch/{batch_id}/download" if output_rows else None,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

@router.get("/batch/{batch_id}/download")
def download_batch(request: Request, batch_id: str):
    try:
        parsed = uuid.UUID(batch_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail={"code": "INVALID_BATCH_ID", "message": "Batch ID must be a UUID."}) from exc
    path = request.app.state.settings.processed_data_dir / "batch_exports" / f"{parsed}.csv"
    if not path.is_file():
        raise HTTPException(status_code=404, detail={"code": "BATCH_NOT_FOUND", "message": "Batch report was not found or has expired."})
    return FileResponse(path, media_type="text/csv", filename=f"churnguard-predictions-{parsed}.csv")

@router.get("/history")
def prediction_history(db: Session = Depends(get_db), limit: int = Query(20, ge=1, le=100), offset: int = Query(0, ge=0),
                      risk_category: str | None = Query(None, pattern="^(Low|Medium|High)$")):
    rows = list_predictions(db, limit=limit, offset=offset, risk_category=risk_category)
    return {"pagination": {"total": count_predictions(db, risk_category), "limit": limit, "offset": offset},
            "data": [_serialize_history(row) for row in rows]}

@router.get("/history/{prediction_id}")
def prediction_history_detail(prediction_id: int, db: Session = Depends(get_db)):
    row = get_prediction(db, prediction_id)
    if row is None:
        raise HTTPException(status_code=404, detail={"code": "PREDICTION_NOT_FOUND", "message": "Prediction history record was not found."})
    return _serialize_history(row, include_input=True)


def _serialize_history(row, include_input=False):
    result = {"id": row.id, "created_at": row.created_at.isoformat(), "customer_id": row.customer_id,
              "churn_probability": row.churn_probability, "predicted_churn": row.predicted_churn,
              "risk_category": row.risk_category, "model_version": row.model_version,
              "explanation_summary": row.explanation_summary}
    if include_input:
        result["input_snapshot"] = row.input_snapshot
    return result
