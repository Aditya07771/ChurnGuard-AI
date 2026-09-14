"""Dataset lookup and explorer operations."""
from __future__ import annotations
import pandas as pd
from app.ml.data_loader import load_dataset
from app.core.config import Settings
from app.core.exceptions import DatasetUnavailableError
from app.utils.data_validation import REQUIRED_COLUMNS, FEATURE_COLUMNS

class DatasetService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.raw_df = None
        self.df = None
        self.metadata = None
        self.error = None
        try:
            self.raw_df, self.df, self.metadata = load_dataset(settings)
        except Exception as exc:
            self.error = str(exc)

    @property
    def available(self) -> bool:
        return self.df is not None and not self.df.empty

    def require(self) -> pd.DataFrame:
        if not self.available:
            raise DatasetUnavailableError(self.error or "The dataset is not available.")
        return self.df

    def summary(self) -> dict:
        df = self.require()
        return {
            "source": self.metadata["source"],
            "row_count": int(len(df)),
            "column_count": int(len(df.columns)),
            "columns": [{"name": column, "dtype": str(df[column].dtype), "missing_count": int(df[column].isna().sum())} for column in df.columns],
            "target_column": "Churn",
            "target_distribution": {str(k): int(v) for k, v in df["Churn"].value_counts().items()},
            "duplicate_rows_removed": self.metadata["cleaning_report"]["duplicate_rows_removed"],
            "cleaning_report": self.metadata["cleaning_report"],
            "dataset_version": self.metadata["fingerprint_sha256"],
            "loaded_at": self.metadata["loaded_at"],
        }

    def missing_values(self) -> dict:
        df = self.require()
        total = len(df)
        data = []
        for column in df.columns:
            count = int(df[column].isna().sum())
            data.append({"column": column, "missing_count": count, "missing_percentage": round(100 * count / total, 4) if total else 0.0})
        return {"row_count": total, "data": data, "before_cleaning": self.metadata["cleaning_report"]["missing_values_before"],
                "after_cleaning": self.metadata["cleaning_report"]["missing_values_after"]}

    def preview(self, limit: int = 20, offset: int = 0, sort_by: str | None = None, sort_order: str = "asc") -> dict:
        df = self.require()
        allowed = set(df.columns)
        if sort_by and sort_by not in allowed:
            raise ValueError(f"Unsupported sort_by. Allowed columns: {', '.join(sorted(allowed))}")
        view = df.sort_values(sort_by, ascending=(sort_order == "asc"), kind="stable", na_position="last") if sort_by else df
        page = view.iloc[offset:offset + limit]
        records = page.astype(object).where(pd.notna(page), None).to_dict(orient="records")
        return {"pagination": {"total": int(len(df)), "limit": limit, "offset": offset}, "data": records,
                "dataset_version": self.metadata["fingerprint_sha256"]}

    def profile(self) -> dict:
        df = self.require()
        numeric = []
        categorical = []
        for column in df.columns:
            if pd.api.types.is_numeric_dtype(df[column]):
                series = df[column].dropna()
                numeric.append({
                    "column": column, "count": int(series.count()),
                    "mean": float(series.mean()) if not series.empty else None,
                    "median": float(series.median()) if not series.empty else None,
                    "std": float(series.std()) if len(series) > 1 else 0.0,
                    "min": float(series.min()) if not series.empty else None,
                    "max": float(series.max()) if not series.empty else None,
                    "quartiles": {"q1": float(series.quantile(.25)) if not series.empty else None,
                                  "q3": float(series.quantile(.75)) if not series.empty else None},
                })
            else:
                counts = df[column].fillna("Missing").astype(str).value_counts().head(30)
                categorical.append({"column": column, "unique_count": int(df[column].nunique(dropna=False)),
                                    "top_categories": [{"value": str(k), "count": int(v)} for k, v in counts.items()]})
        return {"numeric_summary": numeric, "categorical_summary": categorical,
                "dataset_version": self.metadata["fingerprint_sha256"]}
