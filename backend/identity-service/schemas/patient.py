from pydantic import BaseModel, EmailStr, Field


class AcceptInvitationRequest(BaseModel):
    email: EmailStr
    token: str = Field(..., min_length=10)
    doctor_id: str
