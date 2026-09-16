from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.schemas.customer import WhatIfRequest
from app.schemas.prediction import WhatIfResponse
from app.services.scenario_service import evaluate_scenarios

router = APIRouter(prefix="/scenarios", tags=["What-if analysis"])

@router.post("/what-if", response_model=WhatIfResponse)
def what_if(request: Request, payload: WhatIfRequest, db: Session = Depends(get_db)):
    rows = [{"name": item.name, "changes": item.changes} for item in payload.scenarios]
    try:
        return evaluate_scenarios(request, payload.customer.model_dump(), rows, db)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail={"code": "INVALID_SCENARIO", "message": str(exc)}) from exc
