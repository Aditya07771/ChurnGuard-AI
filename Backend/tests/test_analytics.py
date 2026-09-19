def test_analytics_endpoints_return_chart_data(trained_app):
    for path in [
        "/api/v1/analytics/churn-by-contract",
        "/api/v1/analytics/churn-by-tenure",
        "/api/v1/analytics/churn-by-payment-method",
        "/api/v1/analytics/churn-by-internet-service",
        "/api/v1/analytics/churn-by-service",
        "/api/v1/analytics/churn-by-demographics",
        "/api/v1/analytics/charges-distribution",
        "/api/v1/analytics/tenure-distribution",
        "/api/v1/analytics/customer-distribution",
        "/api/v1/analytics/risk-distribution",
        "/api/v1/analytics/feature-importance",
        "/api/v1/analytics/model-comparison",
        "/api/v1/analytics/confusion-matrix",
        "/api/v1/analytics/roc-curve",
        "/api/v1/analytics/precision-recall-curve",
    ]:
        response = trained_app.get(path)
        assert response.status_code == 200, (path, response.text)
        assert response.json() is not None


def test_segment_charts_include_active_risk_when_model_available(trained_app):
    contract = trained_app.get("/api/v1/analytics/churn-by-contract").json()
    assert contract["data"]
    assert "active_high_risk_count" in contract["data"][0]
    charges = trained_app.get("/api/v1/analytics/charges-distribution").json()
    assert "historical_charge_summary_by_churn" in charges
    assert charges["active_risk_by_monthly_charge_band"] is not None


def test_overview_calculates_real_counts(trained_app):
    payload = trained_app.get("/api/v1/overview").json()
    historical = payload["historical"]
    assert historical["total_customers"] == 240
    assert historical["churned_customers"] + historical["retained_customers"] == 240
    assert 0 <= historical["actual_churn_rate"] <= 1
