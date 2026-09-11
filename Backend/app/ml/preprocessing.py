"""Consistent preprocessing and model pipeline builders."""
from __future__ import annotations

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from app.utils.data_validation import CATEGORICAL_COLUMNS, NUMERIC_COLUMNS


def make_preprocessor() -> ColumnTransformer:
    numeric = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    categorical = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])
    return ColumnTransformer(
        transformers=[
            ("numeric", numeric, NUMERIC_COLUMNS),
            ("categorical", categorical, CATEGORICAL_COLUMNS),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )


def make_pipeline(classifier) -> Pipeline:
    """Build a fresh preprocessing + classifier pipeline for each experiment."""
    return Pipeline([
        ("preprocessor", make_preprocessor()),
        ("classifier", classifier),
    ])
