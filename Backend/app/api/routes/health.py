from datetime import datetime, timezone
from fastapi import APIRouter, Request

router = APIRouter(tags=["Health & metadata"])

@router.get("/health")
def health(request: Request):
    dataset = request.app.state.dataset_service
    model = request.app.state.model_registry
    return {
        "status": "ok" if dataset.available and model.available else "degraded",
        "api": "ready",
        "dataset": {"available": dataset.available, "row_count": int(len(dataset.df)) if dataset.available else None,
                    "message": None if dataset.available else dataset.error},
        "model": {"available": model.available, "model_name": model.metadata.get("model_name") if model.available else None,
                   "message": None if model.available else model.error},
        "database": "initialized",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

@router.get("/metadata")
def metadata(request: Request):
    dataset = request.app.state.dataset_service
    model = request.app.state.model_registry
    source = dataset.metadata if dataset.available else None
    model_meta = model.metadata if model.available else None
    return {
        "application": {"name": request.app.state.settings.app_name, "version": request.app.state.settings.app_version,
                        "environment": request.app.state.settings.app_env},
        "dataset": {
            "available": dataset.available,
            "source": source.get("source") if source else None,
            "filename": source.get("path_name") if source else request.app.state.settings.dataset_filename,
            "row_count": source.get("row_count") if source else None,
            "column_count": source.get("column_count") if source else None,
            "columns": list(dataset.df.columns) if dataset.available else [],
            "target_column": "Churn", "loaded_at": source.get("loaded_at") if source else None,
            "fingerprint_sha256": source.get("fingerprint_sha256") if source else None,
            "message": None if dataset.available else dataset.error,
        },
        "model": {"available": model.available,
                  "model_name": model_meta.get("model_name") if model_meta else None,
                  "model_version": model_meta.get("model_version") if model_meta else None,
                  "trained_at": model_meta.get("trained_at") if model_meta else None,
                  "training_row_count": model_meta.get("training_row_count") if model_meta else None,
                  "test_row_count": model_meta.get("test_row_count") if model_meta else None,
                  "message": None if model.available else model.error},
    }
