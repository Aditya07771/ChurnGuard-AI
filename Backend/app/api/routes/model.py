from fastapi import APIRouter, Request

router = APIRouter(prefix="/model", tags=["Model management"])

@router.get("/status")
def model_status(request: Request):
    registry = request.app.state.model_registry
    return {"available": registry.available,
            "model_name": registry.metadata.get("model_name") if registry.available else None,
            "model_version": registry.metadata.get("model_version") if registry.available else None,
            "trained_at": registry.metadata.get("trained_at") if registry.available else None,
            "evaluation_metrics": registry.metrics if registry.available else None,
            "artifact_directory_configured": True,
            "error": registry.error}

@router.get("/metrics")
def model_metrics(request: Request):
    registry = request.app.state.model_registry
    if not registry.available:
        return {"status": "unavailable", "reason": registry.error, "metrics": None}
    return {"status": "available", "model_name": registry.metadata.get("model_name"),
            "model_version": registry.metadata.get("model_version"), "metrics": registry.metrics,
            "classification_report": registry.curves.get("classification_report"),
            "evaluation_dataset": "stratified holdout split; not a live production performance guarantee"}

@router.get("/comparison")
def model_comparison(request: Request):
    registry = request.app.state.model_registry
    if not registry.available:
        return {"status": "unavailable", "reason": registry.error, "data": []}
    return {"status": "available", "selected_model": registry.metadata.get("model_name"),
            "selection_criterion": registry.metadata.get("selection_criterion"), "data": registry.comparison}
