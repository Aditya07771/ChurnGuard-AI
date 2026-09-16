from fastapi import APIRouter, HTTPException, Query, Request
from app.core.exceptions import DatasetUnavailableError, ModelUnavailableError
from app.services.customer_service import list_customers, get_customer, scored_active_customers

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("")
def customers(request: Request, limit: int = Query(20, ge=1, le=100), offset: int = Query(0, ge=0),
              search: str | None = None, risk_category: str | None = Query(None, pattern="^(Low|Medium|High)$"),
              contract: str | None = None, min_tenure: int | None = Query(None, ge=0), max_tenure: int | None = Query(None, ge=0),
              min_monthly_charges: float | None = Query(None, ge=0), max_monthly_charges: float | None = Query(None, ge=0),
              internet_service: str | None = None, payment_method: str | None = None,
              min_probability: float | None = Query(None, ge=0, le=1), max_probability: float | None = Query(None, ge=0, le=1),
              sort_by: str = "churn_probability", sort_order: str = Query("desc", pattern="^(asc|desc)$")):
    try:
        return list_customers(request, limit, offset, search, risk_category, contract, min_tenure, max_tenure,
                              min_monthly_charges, max_monthly_charges, internet_service, payment_method,
                              min_probability, max_probability, sort_by, sort_order)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail={"code": "INVALID_FILTER", "message": str(exc)}) from exc

@router.get("/{customer_id}")
def customer_detail(request: Request, customer_id: str):
    row = get_customer(request, customer_id)
    if row is None:
        raise HTTPException(status_code=404, detail={"code": "CUSTOMER_NOT_FOUND", "message": "No customer has that ID."})
    return row

@router.get("/{customer_id}/prediction")
def customer_prediction(request: Request, customer_id: str):
    row = get_customer(request, customer_id)
    if row is None:
        raise HTTPException(status_code=404, detail={"code": "CUSTOMER_NOT_FOUND", "message": "No customer has that ID."})
    if row.get("Churn") != "No":
        raise HTTPException(status_code=409, detail={"code": "NOT_ACTIVE_ELIGIBLE", "message": "Historical churners are excluded from the default active-customer risk list."})
    if row.get("prediction") is None:
        raise HTTPException(status_code=503, detail={"code": "MODEL_UNAVAILABLE", "message": request.app.state.model_registry.error})
    return {"customer_id": customer_id, **row["prediction"], "model_version": request.app.state.model_registry.metadata.get("model_version")}
