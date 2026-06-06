from pydantic import BaseModel, EmailStr, Field


class CreateMainAffiliateRequest(BaseModel):
    email: EmailStr
    affiliate_code: str = Field(..., min_length=4, max_length=100)


class InviteSubAffiliateRequest(BaseModel):
    email: EmailStr
    affiliate_code: str | None = Field(None, min_length=4, max_length=100)
