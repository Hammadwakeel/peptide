from fastapi import APIRouter

from routes.admin import router as admin_router
from routes.affiliate import router as affiliate_router
from routes.auth import router as auth_router
from routes.doctor import router as doctor_router
from routes.health import router as health_router
from routes.patient import router as patient_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(doctor_router)
api_router.include_router(patient_router)
api_router.include_router(admin_router)
api_router.include_router(affiliate_router)

__all__ = ["api_router"]
