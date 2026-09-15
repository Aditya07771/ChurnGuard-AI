"""Shared column definitions and dataset validation/cleaning functions."""
from __future__ import annotations

import pandas as pd

REQUIRED_COLUMNS = [
    "customerID", "gender", "SeniorCitizen", "Partner", "Dependents", "tenure",
    "PhoneService", "MultipleLines", "InternetService", "OnlineSecurity", "OnlineBackup",
    "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies", "Contract",
    "PaperlessBilling", "PaymentMethod", "MonthlyCharges", "TotalCharges", "Churn",
]
TARGET_COLUMN = "Churn"
ID_COLUMN = "customerID"
NUMERIC_COLUMNS = ["SeniorCitizen", "tenure", "MonthlyCharges", "TotalCharges"]
FEATURE_COLUMNS = [column for column in REQUIRED_COLUMNS if column not in {ID_COLUMN, TARGET_COLUMN}]
CATEGORICAL_COLUMNS = [column for column in FEATURE_COLUMNS if column not in NUMERIC_COLUMNS]

FEATURE_LABELS = {
    "gender": "Gender",
    "SeniorCitizen": "Senior citizen status",
    "Partner": "Partner status",
    "Dependents": "Dependents status",
    "tenure": "Customer tenure",
    "PhoneService": "Phone service",
    "MultipleLines": "Multiple lines",
    "InternetService": "Internet service",
    "OnlineSecurity": "Online security",
    "OnlineBackup": "Online backup",
    "DeviceProtection": "Device protection",
    "TechSupport": "Technical support",
    "StreamingTV": "Streaming TV",
    "StreamingMovies": "Streaming movies",
    "Contract": "Contract type",
    "PaperlessBilling": "Paperless billing",
    "PaymentMethod": "Payment method",
    "MonthlyCharges": "Monthly charges",
    "TotalCharges": "Total charges",
}


def validate_dataset_columns(df: pd.DataFrame) -> None:
    missing = [column for column in REQUIRED_COLUMNS if column not in df.columns]
    if missing:
        raise ValueError(f"Dataset is missing required columns: {', '.join(missing)}")
    if df.empty:
        raise ValueError("Dataset contains no customer records.")
    if df[TARGET_COLUMN].isna().all():
        raise ValueError("The Churn target column is empty; model training is not possible.")
    target_values = set(df[TARGET_COLUMN].dropna().astype(str).str.strip().str.title().unique())
    if not target_values.issubset({"Yes", "No"}) or not target_values:
        raise ValueError(f"Unexpected Churn target values: {sorted(target_values)}")


def clean_dataset(raw_df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """Clean the dataset while retaining historical labels and customer IDs."""
    validate_dataset_columns(raw_df)
    before_missing = raw_df.isna().sum().to_dict()
    blank_total_charges = int((raw_df["TotalCharges"].isna() | raw_df["TotalCharges"].astype(str).str.strip().eq("")).sum())
    df = raw_df.copy()

    # Remove whitespace from text fields before checking categories or targets.
    for column in df.select_dtypes(include=["object", "string"]).columns:
        df[column] = df[column].map(lambda value: value.strip() if isinstance(value, str) else value)
        df[column] = df[column].replace("", pd.NA)

    df["Churn"] = df["Churn"].astype("string").str.strip().str.title()
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
    for column in ["SeniorCitizen", "tenure", "MonthlyCharges"]:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    # In this public dataset, blank TotalCharges rows have zero tenure. Zero is a
    # sensible total charge for a new customer; other missing values stay missing
    # and are handled by the fitted training pipeline.
    new_customer_missing = df["TotalCharges"].isna() & df["tenure"].eq(0)
    inferred_zero_count = int(new_customer_missing.sum())
    df.loc[new_customer_missing, "TotalCharges"] = 0.0

    duplicates = int(df.duplicated().sum())
    if duplicates:
        df = df.drop_duplicates().reset_index(drop=True)

    # A missing target cannot be used for supervised learning and should be an
    # explicit data-quality error rather than silently removed.
    if df["Churn"].isna().any():
        raise ValueError("Dataset contains missing Churn labels. Repair those rows before training.")
    unexpected = set(df["Churn"].astype(str).unique()) - {"Yes", "No"}
    if unexpected:
        raise ValueError(f"Unexpected Churn target values after cleaning: {sorted(unexpected)}")

    report = {
        "original_row_count": int(len(raw_df)),
        "cleaned_row_count": int(len(df)),
        "column_count": int(len(df.columns)),
        "duplicate_rows_removed": duplicates,
        "blank_total_charges_found": blank_total_charges,
        "zero_tenure_total_charges_filled": inferred_zero_count,
        "missing_values_before": {key: int(value) for key, value in before_missing.items() if int(value)},
        "missing_values_after": {key: int(value) for key, value in df.isna().sum().items() if int(value)},
    }
    return df, report


def feature_frame(df: pd.DataFrame) -> pd.DataFrame:
    """Return model inputs only; never include ID or target columns."""
    missing = [column for column in FEATURE_COLUMNS if column not in df.columns]
    if missing:
        raise ValueError(f"Missing model feature columns: {', '.join(missing)}")
    result = df[FEATURE_COLUMNS].copy()
    for column in NUMERIC_COLUMNS:
        result[column] = pd.to_numeric(result[column], errors="coerce")
    return result
