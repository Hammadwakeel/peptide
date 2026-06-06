from pydantic import BaseModel, EmailStr, Field


class ReviewClinicRequest(BaseModel):
    approve: bool
    rejection_reason: str | None = None


class ChangePatientPasswordRequest(BaseModel):
    new_password: str | None = Field(None, min_length=8)
    auto_generate: bool = True


class CreateMainAffiliateRequest(BaseModel):
    email: EmailStr
    affiliate_code: str = Field(..., min_length=4, max_length=100)
