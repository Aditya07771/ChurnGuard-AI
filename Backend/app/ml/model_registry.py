"""Load and expose the trusted locally generated model artifacts."""
from __future__ import annotations

import hashlib
import json
import logging
from pathlib import Path

import joblib
import pandas as pd

from app.core.exceptions import ModelUnavailableError

logger = logging.getLogger(__name__)
ARTIFACT_FILES = [
    "churn_pipeline.joblib", "model_metadata.json", "model_comparison.json",
    "evaluation_metrics.json", "feature_importance.json", "evaluation_curves.json",
]


class ModelRegistry:
    def __init__(self, artifact_dir: Path):
        self.artifact_dir = Path(artifact_dir)
        self.pipeline = None
        self.metadata = None
        self.comparison = []
        self.metrics = {}
        self.feature_importance = []
        self.curves = {}
        self.error: str | None = None
        self.load()

    def load(self) -> None:
        required = [*ARTIFACT_FILES, "artifact_manifest.json"]
        missing = [name for name in required if not (self.artifact_dir / name).is_file()]
        if missing:
            self.error = "Trained model artifacts are missing: " + ", ".join(missing)
            logger.warning(self.error)
            return
        try:
            self._verify_manifest()
            # joblib/pickle artifacts must only be loaded from a trusted local training workflow.
            self.pipeline = joblib.load(self.artifact_dir / "churn_pipeline.joblib")
            self.metadata = _read_json(self.artifact_dir / "model_metadata.json")
            self.comparison = _read_json(self.artifact_dir / "model_comparison.json")
            self.metrics = _read_json(self.artifact_dir / "evaluation_metrics.json")
            self.feature_importance = _read_json(self.artifact_dir / "feature_importance.json")
            self.curves = _read_json(self.artifact_dir / "evaluation_curves.json")
            self.error = None
            logger.info("Loaded model artifact %s.", self.metadata.get("model_name", "unknown"))
        except Exception as exc:
            self.pipeline = None
            self.error = f"Model artifacts could not be loaded: {type(exc).__name__}. Retrain the model locally."
            logger.exception("Could not load model artifacts.")

    def _verify_manifest(self) -> None:
        """Check artifact hashes before loading a pickle-based model file."""
        manifest_path = self.artifact_dir / "artifact_manifest.json"
        manifest = _read_json(manifest_path)
        file_entries = manifest.get("files", {})
        for name in ARTIFACT_FILES:
            # Only allow simple filenames; a modified manifest cannot point outside the artifact folder.
            if Path(name).name != name or name not in file_entries:
                raise ValueError(f"Artifact manifest does not safely describe {name}.")
            path = self.artifact_dir / name
            actual_hash = hashlib.sha256(path.read_bytes()).hexdigest()
            expected_hash = file_entries[name].get("sha256")
            if not expected_hash or actual_hash != expected_hash:
                raise ValueError(f"Artifact integrity check failed for {name}; retrain the model.")

    @property
    def available(self) -> bool:
        return self.pipeline is not None and self.metadata is not None

    def require(self):
        if not self.available:
            raise ModelUnavailableError(self.error or "Model is not trained. Run python -m scripts.train_model.")
        return self.pipeline

    def churn_probabilities(self, features: pd.DataFrame):
        pipeline = self.require()
        classes = list(pipeline.classes_)
        if "Yes" not in classes:
            raise ModelUnavailableError("The saved model does not contain a 'Yes' churn class; retrain it.")
        return pipeline.predict_proba(features)[:, classes.index("Yes")]


def _read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))
