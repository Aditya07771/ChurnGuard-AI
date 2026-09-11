"""Load the public Kaggle dataset with local caching and actionable failures."""
from __future__ import annotations

import hashlib
import logging
import shutil
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from app.core.config import Settings
from app.utils.data_validation import clean_dataset

logger = logging.getLogger(__name__)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def expected_dataset_path(settings: Settings) -> Path:
    return settings.dataset_cache_dir / settings.dataset_filename


def download_dataset(settings: Settings, force: bool = False) -> Path:
    """Download via KaggleHub, preferring dataset_load and falling back to download."""
    settings.dataset_cache_dir.mkdir(parents=True, exist_ok=True)
    target = expected_dataset_path(settings)
    if target.exists() and not force:
        _validate_csv(target)
        logger.info("Using cached dataset: %s", target.name)
        return target

    try:
        import kagglehub
    except ImportError as exc:
        raise RuntimeError(
            "KaggleHub is not installed. Run 'pip install -r requirements.txt', "
            "or place the CSV at data/raw/WA_Fn-UseC_-Telco-Customer-Churn.csv."
        ) from exc

    errors: list[str] = []
    # Current KaggleHub API. dataset_load handles the adapter and file selection.
    try:
        from kagglehub import KaggleDatasetAdapter
        loader = getattr(kagglehub, "dataset_load", None)
        if loader is None:
            loader = getattr(kagglehub, "load_dataset", None)
        if loader is None:
            raise AttributeError("This KaggleHub version has no dataset_load/load_dataset function")
        frame = loader(KaggleDatasetAdapter.PANDAS, settings.dataset_handle, settings.dataset_filename)
        if isinstance(frame, dict):
            raise ValueError("KaggleHub returned multiple data frames; select the expected CSV explicitly.")
        if not isinstance(frame, pd.DataFrame):
            frame = pd.DataFrame(frame)
        _validate_frame(frame)
        temporary = target.with_suffix(".tmp.csv")
        frame.to_csv(temporary, index=False)
        temporary.replace(target)
        logger.info("Downloaded dataset through KaggleHub dataset_load().")
        return target
    except Exception as exc:  # Fall back for old versions, adapter setup, or access failures.
        errors.append(f"dataset_load: {exc}")
        logger.warning("KaggleHub dataset_load failed; trying dataset_download: %s", exc)

    try:
        dataset_path = Path(kagglehub.dataset_download(settings.dataset_handle, path=settings.dataset_filename, force_download=force))
        if dataset_path.is_dir():
            source = dataset_path / settings.dataset_filename
        else:
            source = dataset_path
        if not source.exists():
            candidates = list(dataset_path.parent.rglob(settings.dataset_filename)) if dataset_path.exists() else []
            if not candidates:
                raise FileNotFoundError(f"Expected file {settings.dataset_filename!r} was not found in the KaggleHub cache.")
            source = candidates[0]
        _validate_csv(source)
        if source.resolve() != target.resolve():
            shutil.copy2(source, target)
        logger.info("Downloaded dataset through KaggleHub dataset_download().")
        return target
    except Exception as exc:
        errors.append(f"dataset_download: {exc}")

    raise RuntimeError(
        "Could not download the public Kaggle dataset. Check internet access and KaggleHub setup, "
        "or manually place the CSV in data/raw. Details: " + " | ".join(errors)
    )


def _validate_frame(frame: pd.DataFrame) -> None:
    # Reuse the project's actual schema and target validation without modifying data.
    from app.utils.data_validation import validate_dataset_columns
    validate_dataset_columns(frame)


def _validate_csv(path: Path) -> None:
    if not path.is_file():
        raise FileNotFoundError(f"Dataset CSV does not exist: {path}")
    frame = pd.read_csv(path)
    _validate_frame(frame)


def load_dataset(settings: Settings) -> tuple[pd.DataFrame, pd.DataFrame, dict]:
    """Return raw frame, clean frame, and provenance/cleaning metadata."""
    path: Path | None = None
    if settings.local_dataset_path is not None:
        if not settings.local_dataset_path.is_file():
            raise FileNotFoundError(
                f"LOCAL_DATASET_PATH points to a missing file: {settings.local_dataset_path}. "
                "Correct the path or leave it blank to use data/raw."
            )
        path = settings.local_dataset_path
    else:
        cached = expected_dataset_path(settings)
        if cached.is_file():
            path = cached

    if path is None:
        raise FileNotFoundError(
            f"Dataset not found at {expected_dataset_path(settings)}. Run 'python -m scripts.download_dataset' "
            "or set LOCAL_DATASET_PATH in .env. API startup will not silently download or fabricate data."
        )

    raw_df = pd.read_csv(path)
    clean_df, cleaning_report = clean_dataset(raw_df)
    source = "configured_local_path" if settings.local_dataset_path else "local_cache"
    metadata = {
        "source": source,
        "path_name": path.name,
        "loaded_at": datetime.now(timezone.utc).isoformat(),
        "row_count": int(len(clean_df)),
        "column_count": int(len(clean_df.columns)),
        "fingerprint_sha256": sha256_file(path),
        "cleaning_report": cleaning_report,
    }
    return raw_df, clean_df, metadata
