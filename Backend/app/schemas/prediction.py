"""Prediction and what-if API response schemas."""
from typing import Any, Literal
from pydantic import BaseModel

class PredictionResponse(BaseModel):
    churn_probability: float
    predicted_churn: Literal["Yes", "No"]
    risk_category: Literal["Low", "Medium", "High"]
    thresholds: dict[str, float]
    model_name: str | None
    model_version: str | None
    explanation: dict[str, Any]
    prediction_id: int | None = None
    generated_at: str

class WhatIfResponse(BaseModel):
    baseline: dict[str, Any]
    scenarios: list[dict[str, Any]]
    model_version: str | None
    note: str
    generated_at: str | None = None
