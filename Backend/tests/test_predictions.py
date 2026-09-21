import io

def sample_profile():
    return {
        "gender": "Female", "SeniorCitizen": 0, "Partner": "Yes", "Dependents": "No",
        "tenure": 12, "PhoneService": "Yes", "MultipleLines": "No", "InternetService": "DSL",
        "OnlineSecurity": "No", "OnlineBackup": "Yes", "DeviceProtection": "No", "TechSupport": "No",
        "StreamingTV": "No", "StreamingMovies": "No", "Contract": "Month-to-month",
        "PaperlessBilling": "Yes", "PaymentMethod": "Electronic check", "MonthlyCharges": 60.5,
        "TotalCharges": 726.0,
    }

def test_prediction_history_is_persisted(trained_app):
    profile = sample_profile()
    created = trained_app.post("/api/v1/predictions", json=profile)
    assert created.status_code == 200
    prediction_id = created.json()["prediction_id"]
    rows = trained_app.get("/api/v1/predictions/history").json()
    assert rows["pagination"]["total"] >= 1
    detail = trained_app.get(f"/api/v1/predictions/history/{prediction_id}")
    assert detail.status_code == 200
    assert "input_snapshot" in detail.json()

def test_batch_predictions_and_download(trained_app):
    profile = sample_profile()
    frame = __import__("pandas").DataFrame([{**profile, "customerID": "BATCH-1", "Churn": "Yes"}])
    payload = frame.to_csv(index=False).encode()
    response = trained_app.post("/api/v1/predictions/batch", files={"file": ("customers.csv", payload, "text/csv")})
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["successful_rows"] == 1
    assert body["target_column_ignored"] is True
    download = trained_app.get(body["download_url"])
    assert download.status_code == 200
    assert "churn_probability" in download.text

def test_invalid_batch_file_type_rejected(trained_app):
    response = trained_app.post("/api/v1/predictions/batch", files={"file": ("customers.txt", b"hello", "text/plain")})
    assert response.status_code == 415


def test_bad_batch_columns_rejected(trained_app):
    response = trained_app.post("/api/v1/predictions/batch", files={"file": ("bad.csv", b"gender,Churn\nFemale,No\n", "text/csv")})
    assert response.status_code == 422
