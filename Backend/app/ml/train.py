"""Reproducible model comparison, selection, evaluation, and artifact writing."""
from __future__ import annotations

import hashlib
import json
import logging
import os
import platform
import shutil
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix, f1_score, make_scorer,
    precision_recall_curve, precision_score, recall_score, roc_auc_score, roc_curve,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.inspection import permutation_importance
from sklearn.tree import DecisionTreeClassifier

from app.ml.preprocessing import make_pipeline
from app.utils.data_validation import FEATURE_COLUMNS, NUMERIC_COLUMNS, TARGET_COLUMN, feature_frame

logger = logging.getLogger(__name__)
RANDOM_STATE = 42


def _json_safe(value):
    if isinstance(value, dict):
        return {str(key): _json_safe(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [_json_safe(item) for item in value]
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating, float)):
        return float(value) if np.isfinite(value) else None
    if isinstance(value, (np.ndarray,)):
        return _json_safe(value.tolist())
    if isinstance(value, (pd.Timestamp, datetime)):
        return value.isoformat()
    if isinstance(value, Path):
        return value.name
    return value


def _baseline_profile(x_train: pd.DataFrame) -> dict:
    baseline = {}
    for column in x_train.columns:
        series = x_train[column].dropna()
        if column in NUMERIC_COLUMNS:
            baseline[column] = float(series.median()) if not series.empty else 0.0
        else:
            mode = series.mode()
            baseline[column] = str(mode.iloc[0]) if not mode.empty else "Unknown"
    return baseline


def _metrics(y_true, y_pred, probabilities) -> dict:
    y_binary = (pd.Series(y_true).astype(str) == "Yes").astype(int)
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, pos_label="Yes", zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, pos_label="Yes", zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, pos_label="Yes", zero_division=0)),
        "roc_auc": float(roc_auc_score(y_binary, probabilities)) if len(set(y_binary)) > 1 else None,
    }


def _write_json_atomic(path: Path, content) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(_json_safe(content), indent=2, allow_nan=False), encoding="utf-8")
    temporary.replace(path)


def _candidate_models() -> dict:
    return {
        "Logistic Regression": LogisticRegression(max_iter=1200, class_weight="balanced", random_state=RANDOM_STATE),
        "Decision Tree": DecisionTreeClassifier(max_depth=8, min_samples_leaf=8, class_weight="balanced", random_state=RANDOM_STATE),
        "Random Forest": RandomForestClassifier(n_estimators=140, min_samples_leaf=3, class_weight="balanced_subsample", n_jobs=-1, random_state=RANDOM_STATE),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.06, max_depth=2, random_state=RANDOM_STATE),
    }


def train_model(df: pd.DataFrame, artifact_dir: Path, dataset_fingerprint: str = "unknown", cv_splits: int = 3) -> dict:
    """Train candidates and persist the winner. The test split is never used for selection."""
    artifact_dir = Path(artifact_dir)
    if TARGET_COLUMN not in df.columns:
        raise ValueError("Training frame must include the historical Churn target.")
    x = feature_frame(df)
    y = df[TARGET_COLUMN].astype(str).str.strip()
    if y.nunique() != 2 or not set(y.unique()).issubset({"Yes", "No"}):
        raise ValueError("Training requires both valid target labels: 'Yes' and 'No'.")
    if min(y.value_counts()) < 2:
        raise ValueError("Training requires at least two records in each churn class.")

    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
    )
    folds = min(cv_splits, int(y_train.value_counts().min()))
    if folds < 2:
        raise ValueError("Not enough examples per class for stratified cross-validation.")
    cv = StratifiedKFold(n_splits=folds, shuffle=True, random_state=RANDOM_STATE)

    results = []
    fitted_pipelines = {}
    for name, classifier in _candidate_models().items():
        logger.info("Evaluating candidate model: %s", name)
        pipeline = make_pipeline(classifier)
        cv_scores = cross_val_score(pipeline, x_train, y_train, scoring=make_scorer(f1_score, pos_label="Yes", zero_division=0), cv=cv, n_jobs=1)
        pipeline.fit(x_train, y_train)
        probabilities = pipeline.predict_proba(x_test)[:, list(pipeline.classes_).index("Yes")]
        predictions = np.where(probabilities >= 0.50, "Yes", "No")
        metrics = _metrics(y_test, predictions, probabilities)
        row = {
            "model_name": name,
            "cross_validation_f1_mean": float(np.mean(cv_scores)),
            "cross_validation_f1_std": float(np.std(cv_scores)),
            "holdout_metrics": metrics,
            "selection_metric": "mean stratified cross-validation F1 for the Yes/churn class",
        }
        results.append(row)
        fitted_pipelines[name] = pipeline

    # Candidate selection uses only cross-validation results on the training split.
    results.sort(key=lambda item: item["cross_validation_f1_mean"], reverse=True)
    selected_name = results[0]["model_name"]
    selected_pipeline = fitted_pipelines[selected_name]
    selected_probabilities = selected_pipeline.predict_proba(x_test)[:, list(selected_pipeline.classes_).index("Yes")]
    selected_predictions = np.where(selected_probabilities >= 0.50, "Yes", "No")
    final_metrics = _metrics(y_test, selected_predictions, selected_probabilities)
    labels = ["No", "Yes"]
    matrix = confusion_matrix(y_test, selected_predictions, labels=labels).tolist()
    report = classification_report(
        y_test, selected_predictions, labels=labels, target_names=["Retained (No)", "Churned (Yes)"],
        output_dict=True, zero_division=0,
    )
    fpr, tpr, roc_thresholds = roc_curve((y_test == "Yes").astype(int), selected_probabilities)
    precision, recall, pr_thresholds = precision_recall_curve((y_test == "Yes").astype(int), selected_probabilities)

    logger.info("Calculating permutation feature importance for selected model.")
    permutation = permutation_importance(
        selected_pipeline, x_test, y_test, scoring="roc_auc", n_repeats=3,
        random_state=RANDOM_STATE, n_jobs=1,
    )
    importance = [
        {"feature": column, "display_name": _display_name(column), "importance": float(value),
         "importance_std": float(std), "method": "permutation importance (ROC-AUC)"}
        for column, value, std in zip(x_test.columns, permutation.importances_mean, permutation.importances_std)
    ]
    importance.sort(key=lambda row: abs(row["importance"]), reverse=True)

    thresholds = []
    y_true_int = (y_test == "Yes").astype(int)
    for threshold in [0.30, 0.40, 0.50, 0.60, 0.70]:
        predicted_int = (selected_probabilities >= threshold).astype(int)
        thresholds.append({
            "threshold": threshold,
            "precision": float(precision_score(y_true_int, predicted_int, zero_division=0)),
            "recall": float(recall_score(y_true_int, predicted_int, zero_division=0)),
            "f1": float(f1_score(y_true_int, predicted_int, zero_division=0)),
            "predicted_churn_count": int(predicted_int.sum()),
        })

    trained_at = datetime.now(timezone.utc).isoformat()
    metadata = {
        "model_name": selected_name,
        "model_version": "1.0.0",
        "trained_at": trained_at,
        "dataset_fingerprint": dataset_fingerprint,
        "dataset_row_count": int(len(df)),
        "training_row_count": int(len(x_train)),
        "test_row_count": int(len(x_test)),
        "feature_columns": FEATURE_COLUMNS,
        "target_column": TARGET_COLUMN,
        "positive_class": "Yes",
        "binary_prediction_threshold": 0.50,
        "selection_criterion": "highest mean 3-fold stratified cross-validation F1 on the training split",
        "cross_validation_folds": folds,
        "baseline_profile": _baseline_profile(x_train),
        "evaluation_metrics": final_metrics,
        "python_version": platform.python_version(),
        "scikit_learn_version": sklearn.__version__,
        "pandas_version": pd.__version__,
        "numpy_version": np.__version__,
    }
    curves = {
        "roc_curve": {"fpr": fpr.tolist(), "tpr": tpr.tolist(), "thresholds": roc_thresholds.tolist(), "auc": final_metrics["roc_auc"]},
        "precision_recall_curve": {"precision": precision.tolist(), "recall": recall.tolist(), "thresholds": pr_thresholds.tolist()},
        "confusion_matrix": {"labels": labels, "matrix": matrix},
        "classification_report": report,
        "threshold_comparison": thresholds,
    }

    # Stage all files first. Each final JSON/file is replaced atomically.
    artifact_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="churnguard-stage-", dir=artifact_dir) as staging_name:
        staging = Path(staging_name)
        joblib.dump(selected_pipeline, staging / "churn_pipeline.joblib", compress=3)
        (staging / "model_metadata.json").write_text(json.dumps(_json_safe(metadata), indent=2), encoding="utf-8")
        (staging / "model_comparison.json").write_text(json.dumps(_json_safe(results), indent=2), encoding="utf-8")
        (staging / "evaluation_metrics.json").write_text(json.dumps(_json_safe(final_metrics), indent=2), encoding="utf-8")
        (staging / "feature_importance.json").write_text(json.dumps(_json_safe(importance), indent=2), encoding="utf-8")
        (staging / "evaluation_curves.json").write_text(json.dumps(_json_safe(curves), indent=2), encoding="utf-8")
        manifest = {
            "artifact_version": 1,
            "created_at": trained_at,
            "files": {
                name: {
                    "bytes": (staging / name).stat().st_size,
                    "sha256": hashlib.sha256((staging / name).read_bytes()).hexdigest(),
                }
                for name in ["churn_pipeline.joblib", "model_metadata.json", "model_comparison.json", "evaluation_metrics.json", "feature_importance.json", "evaluation_curves.json"]
            },
            "scikit_learn_version": sklearn.__version__,
            "note": "Only load artifacts created by this trusted local training script.",
        }
        (staging / "artifact_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        for name in manifest["files"]:
            os.replace(staging / name, artifact_dir / name)
        for name in ["artifact_manifest.json"]:
            os.replace(staging / name, artifact_dir / name)

    logger.info("Selected %s (CV F1 %.4f).", selected_name, results[0]["cross_validation_f1_mean"])
    return {"selected_model": selected_name, "metrics": final_metrics, "comparison": results, "metadata": metadata,
            "feature_importance": importance, "curves": curves, "artifacts_dir": str(artifact_dir)}


def _display_name(feature: str) -> str:
    from app.utils.data_validation import FEATURE_LABELS
    return FEATURE_LABELS.get(feature, feature.replace("_", " ").title())
