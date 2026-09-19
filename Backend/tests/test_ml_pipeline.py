from app.ml.model_registry import ModelRegistry
from app.ml.predictor import risk_category
from app.core.config import Settings


def test_model_artifacts_load_and_metrics_are_real(trained_app):
    payload = trained_app.get("/api/v1/model/metrics").json()
    assert payload["status"] == "available"
    assert 0 <= payload["metrics"]["accuracy"] <= 1
    comparison = trained_app.get("/api/v1/model/comparison").json()
    assert len(comparison["data"]) == 4


def test_probabilities_and_explanation_are_returned(trained_app):
    profile = {
        "gender": "Female", "SeniorCitizen": 0, "Partner": "Yes", "Dependents": "No",
        "tenure": 12, "PhoneService": "Yes", "MultipleLines": "No", "InternetService": "DSL",
        "OnlineSecurity": "No", "OnlineBackup": "Yes", "DeviceProtection": "No", "TechSupport": "No",
        "StreamingTV": "No", "StreamingMovies": "No", "Contract": "Month-to-month",
        "PaperlessBilling": "Yes", "PaymentMethod": "Electronic check", "MonthlyCharges": 60.5,
        "TotalCharges": 726.0,
    }
    response = trained_app.post("/api/v1/predictions", json=profile)
    assert response.status_code == 200, response.text
    payload = response.json()
    assert 0 <= payload["churn_probability"] <= 1
    assert payload["risk_category"] in {"Low", "Medium", "High"}
    assert payload["explanation"]["status"] in {"available", "unavailable"}
    assert payload["prediction_id"] is not None


def test_invalid_prediction_is_rejected(trained_app):
    response = trained_app.post("/api/v1/predictions", json={"gender": "Female"})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "REQUEST_VALIDATION_FAILED"


def test_risk_threshold_boundaries():
    settings = Settings(low_risk_threshold=0.3, high_risk_threshold=0.7)
    assert risk_category(0.2999, settings) == "Low"
    assert risk_category(0.3, settings) == "Medium"
    assert risk_category(0.6999, settings) == "Medium"
    assert risk_category(0.7, settings) == "High"
