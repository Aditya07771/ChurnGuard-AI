"""Shared pagination bounds used by API endpoints."""
from fastapi import Query

DEFAULT_LIMIT = 20
MAX_LIMIT = 100

def limit_parameter():
    return Query(DEFAULT_LIMIT, ge=1, le=MAX_LIMIT)

def offset_parameter():
    return Query(0, ge=0)
