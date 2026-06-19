from fastapi import APIRouter, Depends

from middleware.auth import get_current_user, is_doctor, is_patient, require_roles
from schemas.conversation import (
    ConversationListResponse,
    ConversationResponse,
    CreateConversationRequest,
    MarkReadRequest,
)
from schemas.pagination import PaginationQuery
from services import conversation_service

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post("", response_model=ConversationResponse)
async def create_conversation(
    body: CreateConversationRequest,
    user: dict = Depends(require_roles("clinic_owner", "clinic_staff")),
) -> ConversationResponse:
    return await conversation_service.create_conversation_for_doctor(user, body.patient_id)


@router.get("", response_model=ConversationListResponse)
async def list_conversations(
    user: dict = Depends(get_current_user),
    pagination: PaginationQuery = Depends(),
) -> ConversationListResponse:
    if is_doctor(user):
        result = await conversation_service.list_doctor_conversations(user, pagination)
        return ConversationListResponse(
            conversations=result["conversations"],
            pagination=result["pagination"],
        )
    if is_patient(user):
        conversation = await conversation_service.get_patient_conversation(user)
        return ConversationListResponse(conversations=[conversation])
    from fastapi import HTTPException

    raise HTTPException(status_code=403, detail="Insufficient permissions")


@router.get("/me", response_model=ConversationResponse)
async def get_my_conversation(
    user: dict = Depends(require_roles("patient")),
) -> ConversationResponse:
    return await conversation_service.get_patient_conversation(user)


@router.post("/{conversation_id}/read")
async def mark_read(
    conversation_id: str,
    body: MarkReadRequest,
    user: dict = Depends(get_current_user),
) -> dict:
    return await conversation_service.mark_conversation_read(user, conversation_id, body.role)
