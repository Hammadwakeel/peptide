from pydantic import BaseModel, EmailStr, Field


class CreateMainAffiliateRequest(BaseModel):
    email: EmailStr
    affiliate_code: str = Field(..., min_length=4, max_length=100)


class InviteClinicRequest(BaseModel):
    clinic_email: EmailStr | None = None


class InviteSubAffiliateRequest(BaseModel):
    email: EmailStr
