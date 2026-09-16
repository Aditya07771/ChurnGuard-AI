from fastapi import APIRouter
from app.api.routes import health, overview, dataset, analytics, customers, predictions, scenarios, model

def build_api_router() -> APIRouter:
    router = APIRouter()
    router.include_router(health.router)
    router.include_router(overview.router)
    router.include_router(dataset.router)
    router.include_router(analytics.router)
    router.include_router(customers.router)
    router.include_router(predictions.router)
    router.include_router(scenarios.router)
    router.include_router(model.router)
    return router
