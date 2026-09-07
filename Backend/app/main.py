"""Application entry point for the ChurnGuard AI backend."""
from __future__ import annotations
from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.router import build_api_router
from app.core.config import Settings
from app.core.exceptions import DatasetUnavailableError, ModelUnavailableError
from app.core.logging_config import configure_logging
from app.database.connection import create_database
from app.ml.model_registry import ModelRegistry
from app.services.dataset_service import DatasetService

configure_logging()
logger = logging.getLogger(__name__)


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings.from_env()
    settings.validate()

    @asynccontextmanager
    async def lifespan(application: FastAPI):
        logger.info("Starting %s", settings.app_name)
        dataset_service = DatasetService(settings)
        if dataset_service.available:
            logger.info("Loaded %s dataset records.", len(dataset_service.df))
        else:
            logger.warning("Dataset unavailable at startup: %s", dataset_service.error)
        application.state.dataset_service = dataset_service
        application.state.model_registry = ModelRegistry(settings.model_dir)
        application.state.scored_active_customers = None
        application.state.settings = settings
        engine, session_factory = create_database(settings.database_url)
        application.state.database_engine = engine
        application.state.SessionLocal = session_factory
        yield
        engine.dispose()
        logger.info("Stopped %s", settings.app_name)

    application = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "Explainable customer churn prediction and retention analytics. Probabilities estimate "
            "patterns in historical data; they are not certainties or causal claims."
        ),
        docs_url="/docs", redoc_url="/redoc", openapi_url="/openapi.json", lifespan=lifespan,
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.cors_origins),
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Accept"],
    )
    application.include_router(build_api_router(), prefix=settings.api_v1_prefix)

    @application.exception_handler(DatasetUnavailableError)
    async def dataset_unavailable_handler(request: Request, exc: DatasetUnavailableError):
        return JSONResponse(status_code=503, content={"error": {"code": "DATASET_UNAVAILABLE", "message": str(exc)}})

    @application.exception_handler(ModelUnavailableError)
    async def model_unavailable_handler(request: Request, exc: ModelUnavailableError):
        return JSONResponse(status_code=503, content={"error": {"code": "MODEL_UNAVAILABLE", "message": str(exc)}})

    @application.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        errors = [{"field": ".".join(str(part) for part in item["loc"]), "message": item["msg"]} for item in exc.errors()]
        return JSONResponse(status_code=422, content={"error": {"code": "REQUEST_VALIDATION_FAILED", "message": "Request validation failed.", "details": errors}})

    @application.exception_handler(StarletteHTTPException)
    async def http_error_handler(request: Request, exc: StarletteHTTPException):
        detail = exc.detail
        if isinstance(detail, dict) and "code" in detail:
            content = {"error": detail}
        else:
            content = {"error": {"code": "HTTP_ERROR", "message": str(detail)}}
        return JSONResponse(status_code=exc.status_code, content=content, headers=exc.headers)

    @application.get("/", include_in_schema=False)
    def root():
        return {"name": settings.app_name, "message": "Backend is running. Open /docs to explore the API.",
                "api_prefix": settings.api_v1_prefix, "docs": "/docs"}

    return application


app = create_app()
