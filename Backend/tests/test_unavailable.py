from fastapi.testclient import TestClient
from app.core.config import Settings
from app.main import create_app
from tests.conftest import make_test_dataset


def test_missing_dataset_and_model_have_clear_errors(tmp_path):
    settings = Settings(
        app_name="Unavailable State Test",
        dataset_cache_dir=tmp_path / "empty_raw",
        processed_data_dir=tmp_path / "processed",
        model_dir=tmp_path / "empty_artifacts",
        database_url=f"sqlite:///{tmp_path / 'empty.db'}",
        local_dataset_path=None,
    )
    settings.validate()
    with TestClient(create_app(settings)) as client:
        health = client.get("/api/v1/health")
        assert health.status_code == 200
        assert health.json()["status"] == "degraded"
        dataset = client.get("/api/v1/dataset/summary")
        assert dataset.status_code == 503
        assert dataset.json()["error"]["code"] == "DATASET_UNAVAILABLE"
        prediction = client.post("/api/v1/predictions", json={})
        # Pydantic request validation happens before model availability is checked.
        assert prediction.status_code == 422
        profile = {
            "gender": "Female", "SeniorCitizen": 0, "Partner": "Yes", "Dependents": "No",
            "tenure": 12, "PhoneService": "Yes", "MultipleLines": "No", "InternetService": "DSL",
            "OnlineSecurity": "No", "OnlineBackup": "Yes", "DeviceProtection": "No", "TechSupport": "No",
            "StreamingTV": "No", "StreamingMovies": "No", "Contract": "Month-to-month",
            "PaperlessBilling": "Yes", "PaymentMethod": "Electronic check", "MonthlyCharges": 60.5,
            "TotalCharges": 726.0,
        }
        prediction = client.post("/api/v1/predictions", json=profile)
        assert prediction.status_code == 503
        assert prediction.json()["error"]["code"] == "MODEL_UNAVAILABLE"


def test_cors_preflight_accepts_configured_vite_origin(trained_app):
    response = trained_app.options(
        "/api/v1/overview",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_wildcard_cors_is_rejected_when_credentials_are_enabled():
    import pytest
    settings = Settings(cors_origins=("*",))
    with pytest.raises(ValueError, match="explicit frontend origins"):
        settings.validate()
