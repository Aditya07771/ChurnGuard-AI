"""FastAPI request-state and database dependencies."""
from collections.abc import Generator
from fastapi import Request
from sqlalchemy.orm import Session


def get_db(request: Request) -> Generator[Session, None, None]:
    db = request.app.state.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_dataset_service(request: Request):
    return request.app.state.dataset_service


def get_model_registry(request: Request):
    return request.app.state.model_registry
