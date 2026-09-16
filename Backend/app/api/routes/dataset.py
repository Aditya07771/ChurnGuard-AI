from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi import Request
from app.api.dependencies import get_dataset_service
from app.core.exceptions import DatasetUnavailableError

router = APIRouter(prefix="/dataset", tags=["Dataset explorer"])

@router.get("/summary")
def summary(request: Request):
    return request.app.state.dataset_service.summary()

@router.get("/preview")
def preview(request: Request, limit: int = Query(20, ge=1, le=100), offset: int = Query(0, ge=0),
            sort_by: str | None = None, sort_order: str = Query("asc", pattern="^(asc|desc)$")):
    try:
        return request.app.state.dataset_service.preview(limit, offset, sort_by, sort_order)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail={"code": "INVALID_SORT", "message": str(exc)}) from exc

@router.get("/profile")
def profile(request: Request):
    return request.app.state.dataset_service.profile()

@router.get("/missing-values")
def missing_values(request: Request):
    return request.app.state.dataset_service.missing_values()
