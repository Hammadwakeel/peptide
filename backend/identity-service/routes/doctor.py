from fastapi import APIRouter, Depends, File, UploadFile

from middleware.auth import require_roles
from schemas.clinic import (
    InviteClinicMemberRequest,
    UpdateClinicAddressRequest,
    UpdateClinicBankingRequest,
    UpdateClinicBrandingRequest,
    UpdateClinicMemberRequest,
    UpdateClinicProfileRequest,
    UpdateClinicSettingsRequest,
)
from schemas.doctor import InvitePatientRequest
from schemas.pagination import PaginationQuery
from services import clinic_service, doctor_service

router = APIRouter(prefix="/doctor", tags=["doctor"])

clinic_user = require_roles("clinic_owner", "clinic_staff")


@router.get("/clinic/profile")
def get_clinic_profile(user: dict = Depends(clinic_user)) -> dict:
    """View clinic profile, address, branding, banking summary, and settings."""
    return clinic_service.get_clinic_profile(user)


@router.patch("/clinic/profile")
def update_clinic_profile(
    body: UpdateClinicProfileRequest,
    user: dict = Depends(clinic_user),
) -> dict:
    """Update clinic practice details."""
    return clinic_service.update_profile(user, body)


@router.patch("/clinic/address")
def update_clinic_address(
    body: UpdateClinicAddressRequest,
    user: dict = Depends(clinic_user),
) -> dict:
    """Update clinic business address."""
    return clinic_service.update_address(user, body)


@router.patch("/clinic/branding")
def update_clinic_branding(
    body: UpdateClinicBrandingRequest,
    user: dict = Depends(clinic_user),
) -> dict:
    """Update storefront tagline and theme color."""
    return clinic_service.update_branding(user, body)


@router.post("/clinic/logo")
async def upload_clinic_logo(
    logo: UploadFile = File(...),
    user: dict = Depends(clinic_user),
) -> dict:
    """Upload or replace clinic logo."""
    return await clinic_service.upload_logo(user, logo)


@router.patch("/clinic/banking")
def update_clinic_banking(
    body: UpdateClinicBankingRequest,
    user: dict = Depends(clinic_user),
) -> dict:
    """Update clinic bank account details."""
    return clinic_service.update_banking(user, body)


@router.patch("/clinic/settings")
def update_clinic_settings(
    body: UpdateClinicSettingsRequest,
    user: dict = Depends(clinic_user),
) -> dict:
    """Update clinic notification and operational settings."""
    return clinic_service.update_settings(user, body)


@router.get("/clinic/members")
def list_clinic_members(user: dict = Depends(clinic_user)) -> dict:
    """List organization members and pending invitations."""
    return clinic_service.list_members(user)


@router.post("/clinic/members/invite")
def invite_clinic_member(
    body: InviteClinicMemberRequest,
    user: dict = Depends(clinic_user),
) -> dict:
    """Invite an organization member (owner/admin only)."""
    return clinic_service.invite_member(user, body)


@router.patch("/clinic/members/{member_id}")
def update_clinic_member(
    member_id: str,
    body: UpdateClinicMemberRequest,
    user: dict = Depends(clinic_user),
) -> dict:
    """Update member role or access (owner/admin only)."""
    return clinic_service.update_member(user, member_id, body)


@router.delete("/clinic/members/{member_id}")
def remove_clinic_member(
    member_id: str,
    user: dict = Depends(clinic_user),
) -> dict:
    """Remove an organization member (owner/admin only)."""
    return clinic_service.remove_member(user, member_id)


@router.delete("/clinic/members/invitations/{invitation_id}")
def cancel_clinic_invitation(
    invitation_id: str,
    user: dict = Depends(clinic_user),
) -> dict:
    """Cancel a pending organization invitation."""
    return clinic_service.cancel_invitation(user, invitation_id)


@router.post("/patients/invite")
def invite_patient(
    body: InvitePatientRequest,
    user: dict = Depends(clinic_user),
) -> dict:
    """Doctor creates a patient and sends invitation email with doctor_id in link."""
    return doctor_service.invite_patient(user, body)


@router.get("/patients")
def list_patients(
    pagination: PaginationQuery = Depends(),
    user: dict = Depends(clinic_user),
) -> dict:
    """Doctor views patients in their clinic (paginated)."""
    return doctor_service.list_my_patients(user, pagination)
