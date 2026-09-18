"""Train and compare the candidate models using the locally cached dataset."""
import json
from app.core.config import Settings
from app.ml.data_loader import load_dataset
from app.ml.train import train_model


def main():
    settings = Settings.from_env()
    settings.validate()
    _, df, metadata = load_dataset(settings)
    result = train_model(df, settings.model_dir, metadata["fingerprint_sha256"])
    print("Training completed.")
    print(json.dumps({"selected_model": result["selected_model"], "metrics": result["metrics"],
                      "artifacts_dir": result["artifacts_dir"]}, indent=2))

if __name__ == "__main__":
    main()
