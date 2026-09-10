"""Common request/response schemas."""
from pydantic import BaseModel, Field
from typing import Any

class Pagination(BaseModel):
    total: int
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)

class ErrorResponse(BaseModel):
    code: str
    message: str
    details: Any | None = None
