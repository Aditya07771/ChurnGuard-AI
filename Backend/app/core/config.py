"""Centralized configuration loaded from environment variables or a .env file."""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]


def _as_path(value: str | None, default: Path) -> Path:
    if not value:
        return default.resolve()
    path = Path(value).expanduser()
    return (PROJECT_ROOT / path).resolve() if not path.is_absolute() else path.resolve()


@dataclass(frozen=True)
class Settings:
    app_name: str = "ChurnGuard AI"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    host: str = "127.0.0.1"
    port: int = 8000
    dataset_handle: str = "blastchar/telco-customer-churn"
    dataset_filename: str = "WA_Fn-UseC_-Telco-Customer-Churn.csv"
    local_dataset_path: Path | None = None
    dataset_cache_dir: Path = PROJECT_ROOT / "data" / "raw"
    processed_data_dir: Path = PROJECT_ROOT / "data" / "processed"
    model_dir: Path = PROJECT_ROOT / "artifacts"
    database_url: str = "sqlite:///./data/churn_guard.db"
    low_risk_threshold: float = 0.30
    high_risk_threshold: float = 0.70
    prediction_threshold: float = 0.50
    cors_origins: tuple[str, ...] = ("http://localhost:5173",)
    max_batch_rows: int = 5000
    max_upload_size_mb: int = 10
    app_version: str = "1.0.0"

    @classmethod
    def from_env(cls) -> "Settings":
        # A .env file is optional. Environment variables always take precedence.
        try:
            from dotenv import load_dotenv
            load_dotenv(PROJECT_ROOT / ".env", override=False)
        except ImportError:
            pass

        low = float(os.getenv("LOW_RISK_THRESHOLD", "0.30"))
        high = float(os.getenv("HIGH_RISK_THRESHOLD", "0.70"))
        prediction = float(os.getenv("PREDICTION_THRESHOLD", "0.50"))
        if not (0 <= low < high <= 1):
            raise ValueError("LOW_RISK_THRESHOLD and HIGH_RISK_THRESHOLD must satisfy 0 <= low < high <= 1.")
        if not 0 < prediction < 1:
            raise ValueError("PREDICTION_THRESHOLD must be between 0 and 1.")

        origins = tuple(origin.strip() for origin in os.getenv(
            "CORS_ORIGINS", "http://localhost:5173"
        ).split(",") if origin.strip())
        dataset_path_value = os.getenv("LOCAL_DATASET_PATH", "").strip()
        return cls(
            app_name=os.getenv("APP_NAME", "ChurnGuard AI"),
            app_env=os.getenv("APP_ENV", "development"),
            api_v1_prefix=os.getenv("API_V1_PREFIX", "/api/v1").rstrip("/") or "/api/v1",
            host=os.getenv("HOST", "127.0.0.1"),
            port=int(os.getenv("PORT", "8000")),
            dataset_handle=os.getenv("DATASET_HANDLE", "blastchar/telco-customer-churn"),
            dataset_filename=os.getenv("DATASET_FILENAME", "WA_Fn-UseC_-Telco-Customer-Churn.csv"),
            local_dataset_path=_as_path(dataset_path_value, PROJECT_ROOT / "missing.csv") if dataset_path_value else None,
            dataset_cache_dir=_as_path(os.getenv("DATASET_CACHE_DIR"), PROJECT_ROOT / "data" / "raw"),
            processed_data_dir=_as_path(os.getenv("PROCESSED_DATA_DIR"), PROJECT_ROOT / "data" / "processed"),
            model_dir=_as_path(os.getenv("MODEL_DIR"), PROJECT_ROOT / "artifacts"),
            database_url=os.getenv("DATABASE_URL", "sqlite:///./data/churn_guard.db"),
            low_risk_threshold=low,
            high_risk_threshold=high,
            prediction_threshold=prediction,
            cors_origins=origins,
            max_batch_rows=int(os.getenv("MAX_BATCH_ROWS", "5000")),
            max_upload_size_mb=int(os.getenv("MAX_UPLOAD_SIZE_MB", "10")),
            app_version=os.getenv("APP_VERSION", "1.0.0"),
        )

    def validate(self) -> None:
        if self.max_batch_rows < 1:
            raise ValueError("MAX_BATCH_ROWS must be at least 1.")
        if self.max_upload_size_mb < 1:
            raise ValueError("MAX_UPLOAD_SIZE_MB must be at least 1.")
        if "*" in self.cors_origins:
            raise ValueError("CORS_ORIGINS must list explicit frontend origins; wildcard origins are not allowed with credentials enabled.")
        if not self.api_v1_prefix.startswith("/"):
            raise ValueError("API_V1_PREFIX must begin with '/'.")
        self.dataset_cache_dir.mkdir(parents=True, exist_ok=True)
        self.processed_data_dir.mkdir(parents=True, exist_ok=True)
        self.model_dir.mkdir(parents=True, exist_ok=True)
