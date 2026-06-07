from fastapi import APIRouter

from routes.health import router as health_router
from routes.inventory_admin import router as inventory_admin_router
from routes.inventory_clinic import router as inventory_clinic_router
from routes.patient import router as patient_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(inventory_admin_router)
api_router.include_router(inventory_clinic_router)
api_router.include_router(patient_router)

__all__ = ["api_router"]
