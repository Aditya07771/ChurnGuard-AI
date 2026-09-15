"""Orchestrate predictions and persist successful results."""
from __future__ import annotations
from datetime import datetime, timezone
from app.core.exceptions import ModelUnavailableError
from app.database.repository import add_prediction
from app.ml.predictor import predict_one
from app.utils.data_validation import FEATURE_COLUMNS


def predict_and_save(request, profile: dict, db, customer_id: str | None = None, explain: bool = True):
    registry = request.app.state.model_registry
    if not registry.available:
        raise ModelUnavailableError(registry.error or "Model is not trained. Run python -m scripts.train_model.")
    clean_profile = {column: profile.get(column) for column in FEATURE_COLUMNS}
    result = predict_one(clean_profile, registry, request.app.state.settings, explain=explain)
    record = add_prediction(db, clean_profile, result, customer_id=customer_id)
    try:
        db.commit()
        db.refresh(record)
        result["prediction_id"] = record.id
    except Exception:
        db.rollback()
        raise
    result["generated_at"] = datetime.now(timezone.utc).isoformat()
    return result
