from pydantic import BaseModel, Field


class SendMessageRequest(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_user_id: str
    sender_role: str
    message_type: str
    content: str | None = None
    media_key: str | None = None
    media_url: str | None = None
    media_mime: str | None = None
    media_duration_ms: int | None = None
    sender_name: str | None = None
    created_at: str


class MessageListResponse(BaseModel):
    status: bool = True
    messages: list[MessageResponse]
    page: int = 1
    limit: int = 100
    has_more: bool = False
