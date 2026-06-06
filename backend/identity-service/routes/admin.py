from fastapi import APIRouter, Depends

from middleware.auth import require_roles
from schemas.admin import ChangePatientPasswordRequest, CreateMainAffiliateRequest, ReviewClinicRequest
from schemas.pagination import PaginationQuery
from services import admin_service

router = APIRouter(prefix="/admin", tags=["admin"])

admin_user = require_roles("admin", "super_admin")


@router.get("/clinics/pending")
def pending_clinics(
    pagination: PaginationQuery = Depends(),
    _: dict = Depends(admin_user),
) -> dict:
    """Admin approval queue for new clinic applications (paginated)."""
    return admin_service.list_pending_applications(pagination)


@router.post("/clinics/{clinic_id}/review")
def review_clinic(
    clinic_id: str,
    body: ReviewClinicRequest,
    _: dict = Depends(admin_user),
) -> dict:
    """Admin approves or rejects clinic — auto-generates password and emails on approve."""
    return admin_service.review_clinic(clinic_id, body)


@router.get("/clinics")
def list_clinics(
    pagination: PaginationQuery = Depends(),
    _: dict = Depends(admin_user),
) -> dict:
    """Admin views all clinics and doctors (paginated)."""
    return admin_service.list_clinics(pagination)


@router.get("/clinics/{clinic_id}/patients")
def clinic_patients(
    clinic_id: str,
    pagination: PaginationQuery = Depends(),
    _: dict = Depends(admin_user),
) -> dict:
    """Admin views patients for a specific clinic (paginated)."""
    return admin_service.list_clinic_patients(clinic_id, pagination)


@router.post("/affiliates/main")
def create_main_affiliate(
    body: CreateMainAffiliateRequest,
    _: dict = Depends(admin_user),
) -> dict:
    """Create the single main affiliate (only one allowed)."""
    return admin_service.create_main_affiliate(body)


@router.delete("/users/{user_id}")
def delete_user(user_id: str, _: dict = Depends(admin_user)) -> dict:
    """Admin deactivates a user account."""
    return admin_service.delete_user(user_id)


@router.put("/patients/{patient_id}/password")
def change_patient_password(
    patient_id: str,
    body: ChangePatientPasswordRequest,
    _: dict = Depends(admin_user),
) -> dict:
    """Admin changes patient password and emails the new password."""
    return admin_service.change_patient_password(patient_id, body)
