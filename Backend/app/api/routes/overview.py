from datetime import datetime, timezone
from fastapi import APIRouter, Request
from app.services.customer_service import scored_active_customers
from app.core.exceptions import DatasetUnavailableError, ModelUnavailableError
from app.database.repository import count_predictions
from app.api.dependencies import get_db
from fastapi import Depends
from sqlalchemy.orm import Session

router = APIRouter(tags=["Overview"])

@router.get("/overview")
def overview(request: Request, db: Session = Depends(get_db)):
    dataset_service = request.app.state.dataset_service
    registry = request.app.state.model_registry
    if not dataset_service.available:
        raise DatasetUnavailableError(dataset_service.error or "Dataset is not loaded.")
    df = dataset_service.df
    churned = int((df["Churn"] == "Yes").sum())
    retained = int((df["Churn"] == "No").sum())
    scored = scored_active_customers(request) if registry.available else None
    risk_counts = {label: int((scored["risk_category"] == label).sum()) for label in ["Low", "Medium", "High"]} if scored is not None else {"Low": None, "Medium": None, "High": None}
    monthly_risk = float((scored["churn_probability"] * scored["MonthlyCharges"]).sum()) if scored is not None else None
    average_probability = float(scored["churn_probability"].mean()) if scored is not None and not scored.empty else None
    return {
        "historical": {"total_customers": int(len(df)), "churned_customers": churned, "retained_customers": retained,
                       "actual_churn_rate": churned / len(df) if len(df) else 0.0},
        "active_customer_risk": {"eligible_customer_count": int(len(scored)) if scored is not None else None,
                                 "risk_counts": risk_counts,
                                 "risk_percentages": {key: value / len(scored) * 100 if scored is not None and len(scored) else None for key, value in risk_counts.items()},
                                 "average_predicted_probability": average_probability,
                                 "risk_weighted_monthly_charges_estimate": monthly_risk,
                                 "financial_metric_note": "sum(predicted churn probability × monthly charges); a prioritization estimate, not guaranteed revenue loss."},
        "model": {"available": registry.available,
                  "model_name": registry.metadata.get("model_name") if registry.available else None,
                  "model_version": registry.metadata.get("model_version") if registry.available else None,
                  "metrics": registry.metrics if registry.available else None},
        "prediction_history": {"saved_predictions": count_predictions(db)},
        "dataset": {"version": dataset_service.metadata.get("fingerprint_sha256"), "loaded_at": dataset_service.metadata.get("loaded_at")},
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
