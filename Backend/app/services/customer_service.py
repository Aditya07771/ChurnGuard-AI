"""Active-customer scoring, filtering, and individual profile lookup."""
from __future__ import annotations
import pandas as pd
from app.core.exceptions import DatasetUnavailableError, ModelUnavailableError
from app.ml.predictor import risk_category
from app.utils.data_validation import FEATURE_COLUMNS, feature_frame

SORTABLE_CUSTOMER_COLUMNS = {"churn_probability", "tenure", "MonthlyCharges", "Contract", "customerID", "risk_category"}


def scored_active_customers(request) -> pd.DataFrame:
    state = request.app.state
    if state.scored_active_customers is not None:
        return state.scored_active_customers
    dataset = state.dataset_service
    registry = state.model_registry
    if not dataset.available:
        raise DatasetUnavailableError(dataset.error or "Dataset is not loaded.")
    if not registry.available:
        raise ModelUnavailableError(registry.error or "Model is not trained.")
    active = dataset.df.loc[dataset.df["Churn"] == "No"].copy().reset_index(drop=True)
    probabilities = registry.churn_probabilities(feature_frame(active))
    active["churn_probability"] = probabilities
    active["predicted_churn"] = ["Yes" if value >= state.settings.prediction_threshold else "No" for value in probabilities]
    active["risk_category"] = [risk_category(float(value), state.settings) for value in probabilities]
    state.scored_active_customers = active
    return active


def list_customers(request, limit=20, offset=0, search=None, risk_category_filter=None,
                   contract=None, min_tenure=None, max_tenure=None, min_monthly_charges=None,
                   max_monthly_charges=None, internet_service=None, payment_method=None,
                   min_probability=None, max_probability=None, sort_by="churn_probability", sort_order="desc"):
    df = scored_active_customers(request)
    if search:
        df = df[df["customerID"].astype(str).str.contains(search, case=False, regex=False)]
    if risk_category_filter:
        df = df[df["risk_category"] == risk_category_filter]
    for field, value in [("Contract", contract), ("InternetService", internet_service), ("PaymentMethod", payment_method)]:
        if value:
            df = df[df[field].astype(str) == value]
    if min_tenure is not None:
        df = df[df["tenure"] >= min_tenure]
    if max_tenure is not None:
        df = df[df["tenure"] <= max_tenure]
    if min_monthly_charges is not None:
        df = df[df["MonthlyCharges"] >= min_monthly_charges]
    if max_monthly_charges is not None:
        df = df[df["MonthlyCharges"] <= max_monthly_charges]
    if min_probability is not None:
        df = df[df["churn_probability"] >= min_probability]
    if max_probability is not None:
        df = df[df["churn_probability"] <= max_probability]
    total = len(df)
    if sort_by not in SORTABLE_CUSTOMER_COLUMNS:
        raise ValueError(f"sort_by must be one of: {', '.join(sorted(SORTABLE_CUSTOMER_COLUMNS))}")
    df = df.sort_values(sort_by, ascending=(sort_order == "asc"), kind="stable")
    page = df.iloc[offset:offset + limit]
    records = page.astype(object).where(pd.notna(page), None).to_dict(orient="records")
    return {"pagination": {"total": int(total), "limit": limit, "offset": offset}, "data": records}


def get_customer(request, customer_id: str):
    if not request.app.state.dataset_service.available:
        raise DatasetUnavailableError(request.app.state.dataset_service.error or "Dataset is not loaded.")
    df = request.app.state.dataset_service.df
    matched = df[df["customerID"].astype(str) == customer_id]
    if matched.empty:
        return None
    row = matched.iloc[0].to_dict()
    if row.get("Churn") == "No" and request.app.state.model_registry.available:
        active = scored_active_customers(request)
        scores = active[active["customerID"].astype(str) == customer_id]
        if not scores.empty:
            row["prediction"] = {"churn_probability": float(scores.iloc[0]["churn_probability"]),
                                  "predicted_churn": scores.iloc[0]["predicted_churn"],
                                  "risk_category": scores.iloc[0]["risk_category"]}
    else:
        row["prediction"] = None
    return {key: _safe_value(value) for key, value in row.items()}


def _safe_value(value):
    if pd.isna(value):
        return None
    if hasattr(value, "item"):
        return value.item()
    return value
