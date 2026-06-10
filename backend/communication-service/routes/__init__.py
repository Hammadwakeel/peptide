from fastapi import APIRouter

from routes.conversations import router as conversations_router
from routes.health import router as health_router
from routes.messages import router as messages_router
from routes.templates import router as templates_router
from routes.ws import router as ws_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(conversations_router)
api_router.include_router(messages_router)
api_router.include_router(templates_router)
api_router.include_router(ws_router)

__all__ = ["api_router"]
