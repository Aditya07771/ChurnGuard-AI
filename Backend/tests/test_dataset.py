import pandas as pd
import pytest
from app.utils.data_validation import clean_dataset, feature_frame, FEATURE_COLUMNS
from tests.conftest import make_test_dataset


def test_blank_total_charges_is_handled():
    df = make_test_dataset(30)
    df.loc[0, "tenure"] = 0
    df["TotalCharges"] = df["TotalCharges"].astype(object)
    df.loc[0, "TotalCharges"] = " "
    clean, report = clean_dataset(df)
    assert clean.loc[0, "TotalCharges"] == 0.0
    assert report["blank_total_charges_found"] == 1


def test_target_and_identifier_are_not_model_inputs():
    df = make_test_dataset(30)
    clean, _ = clean_dataset(df)
    features = feature_frame(clean)
    assert list(features.columns) == FEATURE_COLUMNS
    assert "Churn" not in features.columns
    assert "customerID" not in features.columns


def test_invalid_dataset_columns_raise():
    df = make_test_dataset(30).drop(columns=["Churn"])
    with pytest.raises(ValueError, match="missing required columns"):
        clean_dataset(df)


def test_dataset_summary_preview_and_missing_values(trained_app):
    summary = trained_app.get("/api/v1/dataset/summary").json()
    assert summary["row_count"] == 240
    preview = trained_app.get("/api/v1/dataset/preview?limit=5&offset=2").json()
    assert len(preview["data"]) == 5
    assert preview["pagination"]["offset"] == 2
    missing = trained_app.get("/api/v1/dataset/missing-values").json()
    assert "data" in missing
