"""Download and validate the real Kaggle dataset into the local project cache."""
from app.core.config import Settings
from app.ml.data_loader import download_dataset, load_dataset


def main():
    settings = Settings.from_env()
    settings.validate()
    path = download_dataset(settings, force=True)
    raw, clean, metadata = load_dataset(settings)
    print(f"Dataset saved to: {path}")
    print(f"Validated shape: {clean.shape[0]} rows × {clean.shape[1]} columns")
    print(f"SHA-256: {metadata['fingerprint_sha256']}")
    print(f"Removed duplicate rows: {metadata['cleaning_report']['duplicate_rows_removed']}")
    print(f"Missing values after cleaning: {metadata['cleaning_report']['missing_values_after']}")

if __name__ == "__main__":
    main()
