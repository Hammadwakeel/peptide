from fastapi import APIRouter

from routes.admin import router as admin_router
from routes.clinic import router as clinic_router
from routes.health import router as health_router
from routes.patient import router as patient_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(admin_router)
api_router.include_router(clinic_router)
api_router.include_router(patient_router)

__all__ = ["api_router"]
