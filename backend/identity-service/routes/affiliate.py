from fastapi import APIRouter, Depends, Query

from middleware.auth import require_roles
from schemas.affiliate import InviteSubAffiliateRequest
from schemas.pagination import PaginationQuery
from services import affiliate_service

router = APIRouter(prefix="/affiliate", tags=["affiliate"])

affiliate_user = require_roles("affiliate")


@router.get("/profile")
def affiliate_profile(user: dict = Depends(affiliate_user)) -> dict:
    """Affiliate views profile — main or sub with referral stats."""
    return affiliate_service.get_affiliate_profile(user)


@router.post("/sub-affiliates/invite")
def invite_sub_affiliate(
    body: InviteSubAffiliateRequest,
    user: dict = Depends(affiliate_user),
) -> dict:
    """Main affiliate invites a sub-affiliate (credentials emailed)."""
    return affiliate_service.invite_sub_affiliate(user, body)


@router.get("/sub-affiliates")
def list_sub_affiliates(
    pagination: PaginationQuery = Depends(),
    user: dict = Depends(affiliate_user),
) -> dict:
    """Main affiliate lists sub-affiliates (paginated)."""
    return affiliate_service.list_sub_affiliates(user, pagination)


@router.get("/referrals/clinics")
def list_clinic_referrals(
    pagination: PaginationQuery = Depends(),
    scope: str = Query("own", pattern="^(own|all)$"),
    user: dict = Depends(affiliate_user),
) -> dict:
    """List clinic/doctor referrals — sub sees own, main can use scope=all."""
    return affiliate_service.list_referred_clinics(user, pagination, scope=scope)
