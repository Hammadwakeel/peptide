from fastapi import APIRouter

from schemas.patient import AcceptInvitationRequest
from services import patient_service

router = APIRouter(prefix="/patient", tags=["patient"])


@router.post("/accept-invitation")
def accept_invitation(body: AcceptInvitationRequest) -> dict:
    """Patient enters email only — auto-generates password and emails it."""
    return patient_service.accept_invitation(body)
