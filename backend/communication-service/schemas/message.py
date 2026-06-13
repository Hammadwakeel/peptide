from pydantic import BaseModel, Field


class MessageReaction(BaseModel):
    emoji: str
    user_id: str
    user_name: str | None = None


class SendMessageRequest(BaseModel):
    content: str = Field(min_length=1, max_length=2000)
    reply_to_message_id: str | None = None


class ToggleReactionRequest(BaseModel):
    emoji: str = Field(min_length=1, max_length=16)


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
    reply_to_message_id: str | None = None
    reactions: list[MessageReaction] = Field(default_factory=list)
    created_at: str


class MessageListResponse(BaseModel):
    status: bool = True
    messages: list[MessageResponse]
    page: int = 1
    limit: int = 100
    has_more: bool = False
