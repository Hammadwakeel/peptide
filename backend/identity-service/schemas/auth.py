from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    role: str = Field(..., examples=["doctor", "patient", "admin", "affiliate"])
    email: EmailStr
    password: str = Field(..., min_length=6)


class CreateAdminRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class SendOtpRequest(BaseModel):
    email: EmailStr


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class SetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=16)
    new_password: str = Field(..., min_length=8)
