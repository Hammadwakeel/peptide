from pydantic import BaseModel, Field


class CreateConversationRequest(BaseModel):
    patient_id: str


class ConversationResponse(BaseModel):
    id: str
    doctor_id: str
    clinic_id: str
    patient_id: str
    status: str
    last_message_at: str | None = None
    patient_name: str | None = None
    doctor_name: str | None = None
    doctor_email: str | None = None
    unread_provider: int = 0
    unread_patient: int = 0
    last_message_preview: str | None = None


class ConversationListResponse(BaseModel):
    status: bool = True
    conversations: list[ConversationResponse]


class MarkReadRequest(BaseModel):
    role: str = Field(description="provider or patient")
