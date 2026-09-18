"""Score eligible retained customers and export a ranked CSV for offline review."""
from pathlib import Path
import pandas as pd
from app.core.config import Settings
from app.ml.data_loader import load_dataset
from app.ml.model_registry import ModelRegistry
from app.ml.predictor import risk_category
from app.utils.data_validation import feature_frame


def main():
    settings = Settings.from_env()
    settings.validate()
    _, df, metadata = load_dataset(settings)
    registry = ModelRegistry(settings.model_dir)
    registry.require()
    active = df[df["Churn"] == "No"].copy().reset_index(drop=True)
    probabilities = registry.churn_probabilities(feature_frame(active))
    active["churn_probability"] = probabilities
    active["predicted_churn"] = ["Yes" if p >= settings.prediction_threshold else "No" for p in probabilities]
    active["risk_category"] = [risk_category(float(p), settings) for p in probabilities]
    active = active.sort_values("churn_probability", ascending=False)
    output = settings.processed_data_dir / "active_customer_risk_scores.csv"
    output.parent.mkdir(parents=True, exist_ok=True)
    active.to_csv(output, index=False)
    print(f"Scored {len(active)} historically retained customers.")
    print(f"Output: {output}")

if __name__ == "__main__":
    main()
