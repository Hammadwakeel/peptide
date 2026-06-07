from fastapi import APIRouter, Depends

from middleware.auth import require_roles
from schemas.doctor import InvitePatientRequest
from schemas.pagination import PaginationQuery
from services import doctor_service

router = APIRouter(prefix="/doctor", tags=["doctor"])


@router.post("/patients/invite")
def invite_patient(
    body: InvitePatientRequest,
    user: dict = Depends(require_roles("clinic_owner", "clinic_staff")),
) -> dict:
    """Doctor creates a patient and sends invitation email with doctor_id in link."""
    return doctor_service.invite_patient(user, body)


@router.get("/patients")
def list_patients(
    pagination: PaginationQuery = Depends(),
    user: dict = Depends(require_roles("clinic_owner", "clinic_staff")),
) -> dict:
    """Doctor views patients in their clinic (paginated)."""
    return doctor_service.list_my_patients(user, pagination)
