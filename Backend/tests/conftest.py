from __future__ import annotations
import random
from pathlib import Path

import pandas as pd
import pytest

from app.core.config import Settings
from app.ml.train import train_model


def make_test_dataset(rows: int = 240) -> pd.DataFrame:
    """Deterministic toy data for tests; never used as app fallback data."""
    rng = random.Random(712)
    records = []
    for index in range(rows):
        tenure = index % 73
        contract = ["Month-to-month", "One year", "Two year"][index % 3]
        payment = ["Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"][index % 4]
        internet = ["DSL", "Fiber optic", "No"][index % 3]
        churn = "Yes" if (contract == "Month-to-month" and tenure < 18) or (index % 7 == 0) else "No"
        monthly = round(25 + (index % 50) * 1.2, 2)
        total = round(monthly * tenure, 2)
        records.append({
            "customerID": f"TEST{index:04d}",
            "gender": "Female" if index % 2 else "Male",
            "SeniorCitizen": index % 2,
            "Partner": "Yes" if index % 3 else "No",
            "Dependents": "No" if index % 4 else "Yes",
            "tenure": tenure,
            "PhoneService": "Yes" if index % 4 else "No",
            "MultipleLines": "No phone service" if index % 4 == 0 else ("Yes" if index % 2 else "No"),
            "InternetService": internet,
            "OnlineSecurity": "No internet service" if internet == "No" else ("Yes" if index % 2 else "No"),
            "OnlineBackup": "No internet service" if internet == "No" else ("Yes" if index % 3 else "No"),
            "DeviceProtection": "No internet service" if internet == "No" else ("Yes" if index % 5 else "No"),
            "TechSupport": "No internet service" if internet == "No" else ("Yes" if index % 6 else "No"),
            "StreamingTV": "No internet service" if internet == "No" else ("Yes" if index % 2 else "No"),
            "StreamingMovies": "No internet service" if internet == "No" else ("Yes" if index % 3 else "No"),
            "Contract": contract,
            "PaperlessBilling": "Yes" if index % 2 else "No",
            "PaymentMethod": payment,
            "MonthlyCharges": monthly,
            "TotalCharges": total,
            "Churn": churn,
        })
    return pd.DataFrame(records)


@pytest.fixture(scope="session")
def trained_app(tmp_path_factory):
    from fastapi.testclient import TestClient
    from app.main import create_app
    root = tmp_path_factory.mktemp("churnguard-test")
    raw_dir = root / "raw"
    artifacts = root / "artifacts"
    processed = root / "processed"
    raw_dir.mkdir()
    df = make_test_dataset()
    csv_path = raw_dir / "WA_Fn-UseC_-Telco-Customer-Churn.csv"
    df.to_csv(csv_path, index=False)
    from app.ml.data_loader import load_dataset
    settings = Settings(
        app_name="ChurnGuard Test",
        dataset_cache_dir=raw_dir,
        processed_data_dir=processed,
        model_dir=artifacts,
        database_url=f"sqlite:///{root / 'test.db'}",
        local_dataset_path=None,
        cors_origins=("http://localhost:5173",),
    )
    settings.validate()
    _, clean, metadata = load_dataset(settings)
    train_model(clean, artifacts, metadata["fingerprint_sha256"], cv_splits=2)
    application = create_app(settings)
    with TestClient(application) as client:
        yield client
