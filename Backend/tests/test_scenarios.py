def test_what_if_scenario_returns_baseline_and_delta(trained_app):
    payload = {
        "customer": {
            "gender": "Female", "SeniorCitizen": 0, "Partner": "Yes", "Dependents": "No",
            "tenure": 12, "PhoneService": "Yes", "MultipleLines": "No", "InternetService": "DSL",
            "OnlineSecurity": "No", "OnlineBackup": "Yes", "DeviceProtection": "No", "TechSupport": "No",
            "StreamingTV": "No", "StreamingMovies": "No", "Contract": "Month-to-month",
            "PaperlessBilling": "Yes", "PaymentMethod": "Electronic check", "MonthlyCharges": 60.5,
            "TotalCharges": 726.0,
        },
        "scenarios": [{"name": "Annual contract scenario", "changes": {"Contract": "One year"}}],
    }
    response = trained_app.post("/api/v1/scenarios/what-if", json=payload)
    assert response.status_code == 200, response.text
    body = response.json()
    assert 0 <= body["baseline"]["churn_probability"] <= 1
    assert len(body["scenarios"]) == 1
    assert "absolute_probability_difference" in body["scenarios"][0]
    assert "causal" in body["note"]


def test_unknown_customer_returns_404(trained_app):
    response = trained_app.get("/api/v1/customers/NO-SUCH-CUSTOMER")
    assert response.status_code == 404


def test_customer_pagination_and_sort(trained_app):
    response = trained_app.get("/api/v1/customers?limit=5&offset=2&sort_by=churn_probability&sort_order=desc")
    assert response.status_code == 200, response.text
    body = response.json()
    assert len(body["data"]) == 5
    assert body["pagination"]["offset"] == 2
