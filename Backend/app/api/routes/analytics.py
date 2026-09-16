from fastapi import APIRouter, Request
from app.services import analytics_service as analytics
from app.services.customer_service import scored_active_customers
from app.core.exceptions import DatasetUnavailableError

router = APIRouter(prefix="/analytics", tags=["Analytics"])

def _dataset(request):
    service = request.app.state.dataset_service
    if not service.available:
        raise DatasetUnavailableError(service.error or "Dataset is not loaded.")
    return service.df, service.metadata["fingerprint_sha256"]

def _active_scores(request):
    return scored_active_customers(request) if request.app.state.model_registry.available else None

@router.get("/churn-by-contract")
def churn_by_contract(request: Request):
    df, version = _dataset(request); return analytics.churn_by_group(df, "Contract", version, _active_scores(request))

@router.get("/churn-by-tenure")
def churn_by_tenure(request: Request):
    df, version = _dataset(request); return analytics.churn_by_tenure(df, version, _active_scores(request))

@router.get("/churn-by-payment-method")
def churn_by_payment_method(request: Request):
    df, version = _dataset(request); return analytics.churn_by_group(df, "PaymentMethod", version, _active_scores(request))

@router.get("/churn-by-internet-service")
def churn_by_internet_service(request: Request):
    df, version = _dataset(request); return analytics.churn_by_group(df, "InternetService", version, _active_scores(request))

@router.get("/churn-by-service")
def churn_by_service(request: Request):
    df, version = _dataset(request); return analytics.churn_by_service(df, version)

@router.get("/charges-distribution")
def charges_distribution_route(request: Request):
    df, version = _dataset(request); return analytics.charges_distribution(df, version, _active_scores(request))

@router.get("/churn-by-demographics")
def churn_by_demographics_route(request: Request):
    df, version = _dataset(request); return analytics.churn_by_demographics(df, version)

@router.get("/tenure-distribution")
def tenure_distribution_route(request: Request):
    df, version = _dataset(request); return analytics.tenure_distribution(df, version)

@router.get("/customer-distribution")
def customer_distribution_route(request: Request):
    df, version = _dataset(request); return analytics.customer_distribution(df, version)

@router.get("/risk-distribution")
def risk_distribution_route(request: Request):
    df, version = _dataset(request)
    if not request.app.state.model_registry.available:
        return analytics.risk_distribution(None, version)
    scored = scored_active_customers(request)
    return analytics.risk_distribution(scored, version)

@router.get("/feature-importance")
def feature_importance(request: Request):
    version = request.app.state.dataset_service.metadata.get("fingerprint_sha256") if request.app.state.dataset_service.available else None
    return analytics.feature_importance(request.app.state.model_registry, version)

@router.get("/model-comparison")
def model_comparison(request: Request):
    return analytics.model_comparison(request.app.state.model_registry)

@router.get("/confusion-matrix")
def confusion_matrix_route(request: Request):
    return analytics.confusion_matrix_data(request.app.state.model_registry)

@router.get("/roc-curve")
def roc_curve_route(request: Request):
    return analytics.curve_data(request.app.state.model_registry, "roc_curve")

@router.get("/precision-recall-curve")
def pr_curve_route(request: Request):
    return analytics.curve_data(request.app.state.model_registry, "precision_recall_curve")

@router.get("/threshold-comparison")
def threshold_comparison(request: Request):
    registry = request.app.state.model_registry
    if not registry.available:
        return {"status": "unavailable", "reason": registry.error, "data": []}
    return {"status": "available", "data": registry.curves.get("threshold_comparison", []),
            "note": "Threshold results are diagnostic comparisons on the held-out evaluation split; choose operating thresholds using deployment validation data."}
