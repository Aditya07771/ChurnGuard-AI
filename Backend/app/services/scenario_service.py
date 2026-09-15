"""Counterfactual-style what-if scenarios using the same fitted model pipeline."""
from __future__ import annotations
from datetime import datetime, timezone
from app.core.exceptions import ModelUnavailableError
from app.database.repository import add_scenario
from app.ml.predictor import predict_one
from app.schemas.customer import CustomerFeatures
from app.utils.data_validation import FEATURE_COLUMNS


def evaluate_scenarios(request, baseline_profile: dict, scenario_rows: list[dict], db):
    registry = request.app.state.model_registry
    if not registry.available:
        raise ModelUnavailableError(registry.error or "Model is not trained.")
    allowed = set(FEATURE_COLUMNS)
    baseline = predict_one(baseline_profile, registry, request.app.state.settings, explain=False)
    results = []
    for scenario in scenario_rows:
        name = scenario["name"]
        changes = scenario["changes"]
        unknown = sorted(set(changes) - allowed)
        if unknown:
            raise ValueError(f"Scenario '{name}' contains unsupported fields: {', '.join(unknown)}")
        updated = dict(baseline_profile)
        updated.update(changes)
        # Re-run Pydantic validation after changes so a scenario cannot bypass input checks.
        validated = CustomerFeatures.model_validate(updated).model_dump()
        result = predict_one(validated, registry, request.app.state.settings, explain=False)
        row = {
            "name": name,
            "changed_fields": list(changes.keys()),
            "changes": changes,
            "churn_probability": result["churn_probability"],
            "predicted_churn": result["predicted_churn"],
            "risk_category": result["risk_category"],
            "absolute_probability_difference": result["churn_probability"] - baseline["churn_probability"],
            "interpretation": "Hypothetical model output only; not evidence that these changes would cause a real-world churn outcome.",
        }
        results.append(row)
        add_scenario(db, name, validated, row, result.get("model_version"))
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise
    return {
        "baseline": {"churn_probability": baseline["churn_probability"], "predicted_churn": baseline["predicted_churn"],
                     "risk_category": baseline["risk_category"]},
        "scenarios": results,
        "model_version": registry.metadata.get("model_version"),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "note": "What-if results describe how this fitted model scores alternative profiles; they do not establish causal effects.",
    }
