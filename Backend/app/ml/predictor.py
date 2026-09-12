"""Shared probability, risk-band, and baseline-perturbation explanation logic."""
from __future__ import annotations

import pandas as pd

from app.core.config import Settings
from app.ml.model_registry import ModelRegistry
from app.utils.data_validation import FEATURE_COLUMNS, FEATURE_LABELS, feature_frame


def risk_category(probability: float, settings: Settings) -> str:
    if probability < settings.low_risk_threshold:
        return "Low"
    if probability < settings.high_risk_threshold:
        return "Medium"
    return "High"


def predict_one(profile: dict, registry: ModelRegistry, settings: Settings, explain: bool = True) -> dict:
    registry.require()
    row = {column: profile.get(column) for column in FEATURE_COLUMNS}
    frame = pd.DataFrame([row], columns=FEATURE_COLUMNS)
    for column in ["SeniorCitizen", "tenure", "MonthlyCharges", "TotalCharges"]:
        frame[column] = pd.to_numeric(frame[column], errors="coerce")
    probability = float(registry.churn_probabilities(feature_frame(frame))[0])
    threshold = settings.prediction_threshold
    prediction = "Yes" if probability >= threshold else "No"
    explanation = explain_one(row, probability, registry) if explain else {"status": "not_requested", "method": None, "top_features": []}
    return {
        "churn_probability": probability,
        "predicted_churn": prediction,
        "risk_category": risk_category(probability, settings),
        "thresholds": {
            "binary_prediction_threshold": threshold,
            "low_risk_below": settings.low_risk_threshold,
            "medium_risk_from": settings.low_risk_threshold,
            "high_risk_from": settings.high_risk_threshold,
        },
        "model_name": registry.metadata.get("model_name"),
        "model_version": registry.metadata.get("model_version"),
        "explanation": explanation,
    }


def explain_one(profile: dict, actual_probability: float, registry: ModelRegistry, top_n: int = 6) -> dict:
    """Estimate local feature contributions by replacing one field with a training baseline.

    A contribution is actual probability minus probability after replacing that one
    value with its training-set median/mode. These are model-behaviour comparisons,
    not SHAP values and not evidence of causation. Contributions do not necessarily sum.
    """
    try:
        baseline = registry.metadata.get("baseline_profile", {})
        if not baseline:
            return {"status": "unavailable", "method": None, "top_features": [],
                    "reason": "Training baseline profile is missing from model metadata."}
        records = []
        for feature in FEATURE_COLUMNS:
            if feature not in baseline:
                continue
            changed = dict(profile)
            changed[feature] = baseline[feature]
            changed_frame = pd.DataFrame([{column: changed.get(column) for column in FEATURE_COLUMNS}], columns=FEATURE_COLUMNS)
            for column in ["SeniorCitizen", "tenure", "MonthlyCharges", "TotalCharges"]:
                changed_frame[column] = pd.to_numeric(changed_frame[column], errors="coerce")
            counterfactual_probability = float(registry.churn_probabilities(feature_frame(changed_frame))[0])
            contribution = actual_probability - counterfactual_probability
            records.append({
                "feature": feature,
                "display_name": FEATURE_LABELS.get(feature, feature),
                "customer_value": _json_value(profile.get(feature)),
                "baseline_value": _json_value(baseline[feature]),
                "contribution": float(contribution),
                "direction": "toward_higher_churn" if contribution > 0 else "toward_lower_churn" if contribution < 0 else "no_change",
            })
        records.sort(key=lambda item: abs(item["contribution"]), reverse=True)
        return {
            "status": "available",
            "method": "single-feature baseline perturbation",
            "contribution_scale": "absolute change in predicted churn probability (0 to 1), not a percent point unless multiplied by 100",
            "baseline_description": "Training-split median for numeric fields and training-split mode for categorical fields",
            "interpretation_note": "This describes model behaviour relative to the reference profile. Contributions are not causal, are not SHAP values, and do not necessarily sum to the prediction.",
            "top_features": records[:top_n],
        }
    except Exception as exc:
        return {"status": "unavailable", "method": None, "top_features": [],
                "reason": f"The local explanation could not be calculated ({type(exc).__name__})."}


def _json_value(value):
    if value is None:
        return None
    if pd.isna(value):
        return None
    if hasattr(value, "item"):
        return value.item()
    return value
