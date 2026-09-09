"""Database tables for predictions and hypothetical scenarios."""
from __future__ import annotations
from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, Integer, JSON, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    customer_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    input_snapshot: Mapped[dict] = mapped_column(JSON, nullable=False)
    churn_probability: Mapped[float] = mapped_column(Float, nullable=False)
    predicted_churn: Mapped[str] = mapped_column(String(8), nullable=False)
    risk_category: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    model_version: Mapped[str | None] = mapped_column(String(64), nullable=True)
    explanation_summary: Mapped[dict | None] = mapped_column(JSON, nullable=True)


class ScenarioHistory(Base):
    __tablename__ = "scenario_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    scenario_name: Mapped[str] = mapped_column(String(128), nullable=False)
    input_snapshot: Mapped[dict] = mapped_column(JSON, nullable=False)
    result_snapshot: Mapped[dict] = mapped_column(JSON, nullable=False)
    model_version: Mapped[str | None] = mapped_column(String(64), nullable=True)
