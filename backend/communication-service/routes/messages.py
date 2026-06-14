from fastapi import APIRouter, Depends, File, Form, Query, UploadFile

from config import CHAT_MESSAGES_DEFAULT_LIMIT, CHAT_MESSAGES_MAX_LIMIT
from middleware.auth import get_current_user
from schemas.message import (
    MessageListResponse,
    MessageResponse,
    SendMessageRequest,
    ToggleReactionRequest,
)
from services import message_service

router = APIRouter(tags=["messages"])


@router.get("/conversations/{conversation_id}/messages", response_model=MessageListResponse)
async def list_messages(
    conversation_id: str,
    limit: int = Query(CHAT_MESSAGES_DEFAULT_LIMIT, ge=1, le=CHAT_MESSAGES_MAX_LIMIT),
    before_id: str | None = Query(None, description="Load messages older than this message id"),
    user: dict = Depends(get_current_user),
) -> MessageListResponse:
    messages, has_more = await message_service.list_conversation_messages(
        user,
        conversation_id,
        limit=limit,
        before_id=before_id,
    )
    return MessageListResponse(messages=messages, page=1, limit=limit, has_more=has_more)


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse, status_code=201)
async def send_message(
    conversation_id: str,
    body: SendMessageRequest,
    user: dict = Depends(get_current_user),
) -> MessageResponse:
    message = await message_service.send_text_message(
        user,
        conversation_id,
        body.content,
        reply_to_message_id=body.reply_to_message_id,
    )
    return MessageResponse(**message)


@router.post("/conversations/{conversation_id}/messages/upload", response_model=MessageResponse, status_code=201)
async def upload_message(
    conversation_id: str,
    message_type: str = Form(...),
    file: UploadFile = File(...),
    content: str | None = Form(None),
    media_duration_ms: int | None = Form(None),
    reply_to_message_id: str | None = Form(None),
    user: dict = Depends(get_current_user),
) -> MessageResponse:
    message = await message_service.send_media_message(
        user,
        conversation_id,
        file,
        message_type=message_type,
        content=content,
        media_duration_ms=media_duration_ms,
        reply_to_message_id=reply_to_message_id,
    )
    return MessageResponse(**message)


@router.post(
    "/conversations/{conversation_id}/messages/{message_id}/reactions",
    response_model=MessageResponse,
)
async def toggle_reaction(
    conversation_id: str,
    message_id: str,
    body: ToggleReactionRequest,
    user: dict = Depends(get_current_user),
) -> MessageResponse:
    message = await message_service.toggle_message_reaction(
        user,
        conversation_id,
        message_id,
        body.emoji,
    )
    return MessageResponse(**message)
