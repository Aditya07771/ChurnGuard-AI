"""Model metadata and health response schemas."""
from typing import Any
from pydantic import BaseModel

class ModelStatus(BaseModel):
    available: bool
    model_name: str | None = None
    model_version: str | None = None
    trained_at: str | None = None
    error: str | None = None
    metrics: dict[str, Any] | None = None
