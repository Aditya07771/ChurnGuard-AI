"""Real dataset and model evaluation analytics shaped for frontend charts."""
from __future__ import annotations
import numpy as np
import pandas as pd
from app.utils.data_validation import FEATURE_LABELS


def chart(chart_type, title, x_key, series, data, dataset_version=None, source="historical_dataset"):
    return {"chart_type": chart_type, "title": title, "x_key": x_key, "series": series, "data": _records(data),
            "meta": {"source": source, "dataset_version": dataset_version}}


def _records(data):
    if isinstance(data, pd.DataFrame):
        data = data.to_dict(orient="records")
    result = []
    for row in data:
        clean = {}
        for key, value in row.items():
            if pd.isna(value):
                clean[key] = None
            elif isinstance(value, (np.integer,)):
                clean[key] = int(value)
            elif isinstance(value, (np.floating, float)):
                clean[key] = float(value) if np.isfinite(value) else None
            else:
                clean[key] = value.item() if hasattr(value, "item") else value
        result.append(clean)
    return result


def churn_by_group(df: pd.DataFrame, column: str, version: str, scored_active: pd.DataFrame | None = None):
    group = df.copy()
    group[column] = group[column].fillna("Missing").astype(str)
    out = group.groupby(column, dropna=False).agg(
        customer_count=("Churn", "size"),
        churned_count=("Churn", lambda values: int((values == "Yes").sum())),
        retained_count=("Churn", lambda values: int((values == "No").sum())),
        average_tenure=("tenure", "mean"),
        average_monthly_charges=("MonthlyCharges", "mean"),
    ).reset_index().rename(columns={column: column[0].lower() + column[1:]})
    out["churn_rate"] = out["churned_count"] / out["customer_count"].replace(0, np.nan)
    out["churn_rate"] = out["churn_rate"].fillna(0.0)
    output_key = column[0].lower() + column[1:]
    if scored_active is not None:
        active = scored_active.copy()
        active[column] = active[column].fillna("Missing").astype(str)
        for index, aggregate in out.iterrows():
            group = active[active[column] == str(aggregate[output_key])]
            out.loc[index, "active_scored_customer_count"] = int(len(group))
            for band in ["Low", "Medium", "High"]:
                out.loc[index, f"active_{band.lower()}_risk_count"] = int((group["risk_category"] == band).sum())
    out = out.sort_values("customer_count", ascending=False)
    return chart("bar", f"Historical Churn by {column}", output_key,
                 [{"key": "churn_rate", "label": "Historical churn rate"}], out, version)


def churn_by_tenure(df: pd.DataFrame, version: str, scored_active: pd.DataFrame | None = None):
    labels = ["0–6 months", "7–12 months", "13–24 months", "25–48 months", "49–72 months"]
    bins = [-1, 6, 12, 24, 48, 120]
    work = df.copy()
    work["tenure_band"] = pd.cut(pd.to_numeric(work["tenure"], errors="coerce"), bins=bins, labels=labels, include_lowest=True)
    work["tenure_band"] = work["tenure_band"].astype("string")
    out = work.groupby("tenure_band", observed=False, dropna=False).agg(
        customer_count=("Churn", "size"),
        churned_count=("Churn", lambda values: int((values == "Yes").sum())),
        retained_count=("Churn", lambda values: int((values == "No").sum())),
        average_monthly_charges=("MonthlyCharges", "mean"),
    ).reset_index()
    out["churn_rate"] = (out["churned_count"] / out["customer_count"].replace(0, np.nan)).fillna(0.0)
    if scored_active is not None:
        active = scored_active.copy()
        active["tenure_band"] = pd.cut(pd.to_numeric(active["tenure"], errors="coerce"), bins=bins, labels=labels, include_lowest=True).astype("string")
        for index, aggregate in out.iterrows():
            group = active[active["tenure_band"] == str(aggregate["tenure_band"])]
            out.loc[index, "active_scored_customer_count"] = int(len(group))
            for band in ["Low", "Medium", "High"]:
                out.loc[index, f"active_{band.lower()}_risk_count"] = int((group["risk_category"] == band).sum())
    return chart("bar", "Historical Churn by Customer Tenure", "tenure_band",
                 [{"key": "churn_rate", "label": "Historical churn rate"}], out, version)


def churn_by_service(df: pd.DataFrame, version: str):
    service_columns = ["PhoneService", "MultipleLines", "InternetService", "OnlineSecurity", "OnlineBackup",
                       "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies", "PaperlessBilling"]
    rows = []
    for column in service_columns:
        for category, group in df.groupby(df[column].fillna("Missing").astype(str), dropna=False):
            count = len(group)
            churned = int((group["Churn"] == "Yes").sum())
            rows.append({"service": column, "category": str(category), "customer_count": count,
                         "churned_count": churned, "churn_rate": churned / count if count else 0.0})
    return chart("bar", "Historical Churn by Service", "service",
                 [{"key": "churn_rate", "label": "Historical churn rate"}], rows, version)


def charges_distribution(df: pd.DataFrame, version: str, scored_active: pd.DataFrame | None = None):
    rows = []
    for column in ["MonthlyCharges", "TotalCharges"]:
        series = pd.to_numeric(df[column], errors="coerce")
        if series.notna().sum() == 0:
            continue
        # Quantile bins stay robust when values repeat; duplicate edges are dropped.
        bins = pd.qcut(series, q=min(10, max(2, series.nunique())), duplicates="drop")
        grouped = df.assign(_charge_band=bins.astype(str)).groupby("_charge_band", dropna=False).agg(
            customer_count=("Churn", "size"),
            churned_count=("Churn", lambda values: int((values == "Yes").sum())),
        ).reset_index().rename(columns={"_charge_band": "charge_band"})
        grouped.insert(0, "charge_type", column)
        grouped["churn_rate"] = grouped["churned_count"] / grouped["customer_count"].replace(0, np.nan)
        grouped["churn_rate"] = grouped["churn_rate"].fillna(0.0)
        rows.extend(grouped.to_dict(orient="records"))
    response = chart("bar", "Charge Distributions by Range", "charge_band",
                     [{"key": "customer_count", "label": "Customers"}], rows, version)
    historical_summary = df.groupby("Churn").agg(
        customer_count=("Churn", "size"),
        average_monthly_charges=("MonthlyCharges", "mean"),
        average_total_charges=("TotalCharges", "mean"),
    ).reset_index()
    response["historical_charge_summary_by_churn"] = _records(historical_summary)

    if scored_active is not None and not scored_active.empty:
        active_charges = scored_active.copy()
        bands = pd.qcut(pd.to_numeric(active_charges["MonthlyCharges"], errors="coerce"), q=5, duplicates="drop")
        active_charges["monthly_charge_band"] = bands.astype(str)
        risk_rows = []
        for name, group in active_charges.groupby("monthly_charge_band", dropna=False):
            row = {"monthly_charge_band": str(name), "customer_count": int(len(group))}
            for band in ["Low", "Medium", "High"]:
                row[f"{band.lower()}_risk_count"] = int((group["risk_category"] == band).sum())
            risk_rows.append(row)
        response["active_risk_by_monthly_charge_band"] = risk_rows
    else:
        response["active_risk_by_monthly_charge_band"] = None
    return response


def tenure_distribution(df: pd.DataFrame, version: str):
    work = df.copy()
    bins = [-1, 6, 12, 24, 48, 72, 120]
    labels = ["0–6", "7–12", "13–24", "25–48", "49–72", "73+"]
    work["tenure_band"] = pd.cut(pd.to_numeric(work["tenure"], errors="coerce"), bins=bins, labels=labels, include_lowest=True)
    counts = work["tenure_band"].value_counts(sort=False, dropna=False).rename_axis("tenure_band").reset_index(name="customer_count")
    return chart("bar", "Customer Tenure Distribution", "tenure_band", [{"key": "customer_count", "label": "Customers"}], counts, version)


def customer_distribution(df: pd.DataFrame, version: str):
    columns = ["Churn", "Contract", "PaymentMethod", "InternetService", "gender"]
    data = {}
    for column in columns:
        counts = df[column].fillna("Missing").astype(str).value_counts().rename_axis("category").reset_index(name="customer_count")
        data[column] = chart("bar", f"Customer Distribution: {column}", "category",
                             [{"key": "customer_count", "label": "Customers"}], counts, version)
    return {"charts": data, "dataset_version": version}


def risk_distribution(scored: pd.DataFrame, version: str):
    if scored is None:
        return {"status": "unavailable", "reason": "Model predictions are unavailable; train/load a model before requesting risk distribution.", "data": []}
    if scored.empty:
        rows = [{"risk_category": label, "customer_count": 0, "percentage": 0.0} for label in ["Low", "Medium", "High"]]
    else:
        counts = scored["risk_category"].value_counts()
        total = len(scored)
        rows = [{"risk_category": label, "customer_count": int(counts.get(label, 0)),
                 "percentage": float(100 * counts.get(label, 0) / total)} for label in ["Low", "Medium", "High"]]
    return chart("bar", "Predicted Risk Distribution of Historically Retained Customers", "risk_category",
                 [{"key": "customer_count", "label": "Active eligible customers"}], rows, version, source="model_predictions")



def churn_by_demographics(df: pd.DataFrame, version: str):
    columns = ["gender", "SeniorCitizen", "Partner", "Dependents"]
    rows = []
    for column in columns:
        work = df.copy()
        work[column] = work[column].fillna("Missing").astype(str)
        for category, group in work.groupby(column, dropna=False):
            total = len(group)
            churned = int((group["Churn"] == "Yes").sum())
            rows.append({"feature": column, "category": str(category), "customer_count": total,
                         "churned_count": churned, "retained_count": total - churned,
                         "churn_rate": churned / total if total else 0.0})
    return chart("bar", "Descriptive Churn Patterns by Demographic and Household Attributes", "category",
                 [{"key": "churn_rate", "label": "Historical churn rate"}], rows, version)


def feature_importance(registry, version: str):
    if not registry.available:
        return {"status": "unavailable", "reason": registry.error, "data": []}
    return {"status": "available", "method": "permutation importance (ROC-AUC)",
            "interpretation": "Scores estimate how much shuffling one input column affects ROC-AUC on the held-out evaluation data. They are not causal effects.",
            "data": registry.feature_importance, "model_version": registry.metadata.get("model_version"),
            "dataset_version": version}


def model_comparison(registry):
    if not registry.available:
        return {"status": "unavailable", "reason": registry.error, "data": []}
    return {"status": "available", "selection_criterion": registry.metadata.get("selection_criterion"),
            "selected_model": registry.metadata.get("model_name"), "data": registry.comparison}


def confusion_matrix_data(registry):
    if not registry.available:
        return {"status": "unavailable", "reason": registry.error}
    return {"status": "available", **registry.curves.get("confusion_matrix", {})}


def curve_data(registry, key: str):
    if not registry.available:
        return {"status": "unavailable", "reason": registry.error}
    return {"status": "available", **registry.curves.get(key, {})}


def _display(value):
    return FEATURE_LABELS.get(value, value)
