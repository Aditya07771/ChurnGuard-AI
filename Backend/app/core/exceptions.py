"""Small domain exceptions that become safe JSON API errors."""

class DatasetUnavailableError(RuntimeError):
    """Raised when dataset-backed functionality cannot run."""

class ModelUnavailableError(RuntimeError):
    """Raised when no valid trained model artifact is available."""

class DataValidationError(ValueError):
    """Raised when an external dataset fails project validation."""
