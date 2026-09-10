"""Schemas for chart-friendly JSON data."""
from typing import Any
from pydantic import BaseModel

class ChartResponse(BaseModel):
    chart_type: str
    title: str
    x_key: str | None = None
    series: list[dict[str, Any]] = []
    data: list[dict[str, Any]]
    meta: dict[str, Any] = {}
