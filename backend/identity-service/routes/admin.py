from fastapi import APIRouter, Depends, Query

from middleware.auth import require_roles
from schemas.admin import (
    ChangePatientPasswordRequest,
    CreateAffiliateRequest,
    ReviewApplicationRequest,
    UpdateAffiliateProfitMarginRequest,
    UpdateAffiliateSubAffiliateLimitRequest,
    UpdatePlatformSettingsRequest,
)
from schemas.pagination import PaginationQuery
from services import admin_service

router = APIRouter(prefix="/admin", tags=["admin"])

admin_user = require_roles("admin", "super_admin")


@router.get("/applications")
def list_applications(
    pagination: PaginationQuery = Depends(),
    status: str | None = Query(
        None,
        description="Comma-separated application statuses, e.g. submitted,pending_review",
    ),
    _: dict = Depends(admin_user),
) -> dict:
    """Admin approval queue — paginated clinic applications with documents and banking summary."""
    return admin_service.list_applications_queue(pagination, status)


@router.patch("/applications/{application_id}")
def review_application(
    application_id: str,
    body: ReviewApplicationRequest,
    _: dict = Depends(admin_user),
) -> dict:
    """Approve, reject, or request more info for a clinic application."""
    return admin_service.review_application(application_id, body)


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


@router.get("/affiliates")
def list_affiliates(
    pagination: PaginationQuery = Depends(),
    _: dict = Depends(admin_user),
) -> dict:
    """Admin lists all affiliate accounts."""
    return admin_service.list_affiliates(pagination)


@router.post("/affiliates")
def create_affiliate(
    body: CreateAffiliateRequest,
    _: dict = Depends(admin_user),
) -> dict:
    """Admin creates a main affiliate. A set-password link is emailed to the affiliate."""
    return admin_service.create_affiliate(body)


@router.patch("/affiliates/{affiliate_id}/profit-margin")
def update_affiliate_profit_margin(
    affiliate_id: str,
    body: UpdateAffiliateProfitMarginRequest,
    _: dict = Depends(admin_user),
) -> dict:
    """Admin sets the profit margin (0–100%) for a main affiliate; all sub-affiliates inherit it."""
    return admin_service.update_affiliate_profit_margin(affiliate_id, body)


@router.patch("/affiliates/{affiliate_id}/sub-affiliate-limit")
def update_affiliate_sub_affiliate_limit(
    affiliate_id: str,
    body: UpdateAffiliateSubAffiliateLimitRequest,
    _: dict = Depends(admin_user),
) -> dict:
    """Admin sets how many sub-affiliates a main affiliate may invite (null = unlimited)."""
    return admin_service.update_affiliate_sub_affiliate_limit(affiliate_id, body)


@router.get("/settings")
def get_platform_settings(_: dict = Depends(admin_user)) -> dict:
    """Admin reads platform-wide commission, payout, and shipping settings."""
    return admin_service.get_platform_settings()


@router.patch("/settings")
def update_platform_settings(
    body: UpdatePlatformSettingsRequest,
    _: dict = Depends(admin_user),
) -> dict:
    """Admin updates platform-wide settings such as default profit margin."""
    return admin_service.update_platform_settings(body)


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
