"""Database functions kept separate from the HTTP routes."""
from __future__ import annotations
from datetime import datetime, timezone
from sqlalchemy import select, desc
from sqlalchemy.orm import Session
from app.database.models import PredictionHistory, ScenarioHistory


def add_prediction(db: Session, profile: dict, result: dict, customer_id: str | None = None) -> PredictionHistory:
    record = PredictionHistory(
        created_at=datetime.now(timezone.utc),
        customer_id=customer_id,
        input_snapshot=profile,
        churn_probability=float(result["churn_probability"]),
        predicted_churn=result["predicted_churn"],
        risk_category=result["risk_category"],
        model_version=result.get("model_version"),
        explanation_summary={
            "status": result.get("explanation", {}).get("status"),
            "method": result.get("explanation", {}).get("method"),
            "top_features": result.get("explanation", {}).get("top_features", [])[:3],
        },
    )
    db.add(record)
    return record


def add_scenario(db: Session, name: str, input_snapshot: dict, result_snapshot: dict, model_version: str | None):
    record = ScenarioHistory(
        scenario_name=name,
        input_snapshot=input_snapshot,
        result_snapshot=result_snapshot,
        model_version=model_version,
        created_at=datetime.now(timezone.utc),
    )
    db.add(record)
    return record


def get_prediction(db: Session, prediction_id: int):
    return db.get(PredictionHistory, prediction_id)


def list_predictions(db: Session, limit: int = 20, offset: int = 0, risk_category: str | None = None):
    query = select(PredictionHistory)
    if risk_category:
        query = query.where(PredictionHistory.risk_category == risk_category)
    query = query.order_by(desc(PredictionHistory.created_at), desc(PredictionHistory.id)).offset(offset).limit(limit)
    return list(db.scalars(query).all())


def count_predictions(db: Session, risk_category: str | None = None) -> int:
    from sqlalchemy import func
    query = select(func.count()).select_from(PredictionHistory)
    if risk_category:
        query = query.where(PredictionHistory.risk_category == risk_category)
    return int(db.scalar(query) or 0)
