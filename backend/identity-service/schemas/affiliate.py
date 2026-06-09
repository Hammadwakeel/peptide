from pydantic import BaseModel, EmailStr, Field


class CreateMainAffiliateRequest(BaseModel):
    email: EmailStr
    affiliate_code: str = Field(..., min_length=4, max_length=100)


class InviteSubAffiliateRequest(BaseModel):
    email: EmailStr
    affiliate_code: str | None = Field(None, min_length=8, max_length=8, pattern=r"^\d{8}$")


class InviteDoctorRequest(BaseModel):
    doctor_email: EmailStr | None = None
