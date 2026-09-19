def test_health_reports_loaded_components(trained_app):
    response = trained_app.get("/api/v1/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["dataset"]["available"] is True
    assert payload["model"]["available"] is True


def test_metadata_contains_dimensions(trained_app):
    payload = trained_app.get("/api/v1/metadata").json()
    assert payload["dataset"]["row_count"] == 240
    assert payload["dataset"]["column_count"] == 21
