from datetime import date

from pydantic import BaseModel, EmailStr, Field


class AcceptInvitationRequest(BaseModel):
    email: EmailStr
    token: str = Field(..., min_length=10)
    doctor_id: str


class UpdatePatientProfileRequest(BaseModel):
    first_name: str | None = Field(None, min_length=1, max_length=100)
    last_name: str | None = Field(None, min_length=1, max_length=100)
    phone: str | None = Field(None, max_length=50)
    dob: date | None = None


class PatientAddressInput(BaseModel):
    label: str = Field("Home", min_length=1, max_length=100)
    line1: str = Field(..., min_length=1)
    line2: str | None = None
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=2, max_length=2)
    zip: str = Field(..., min_length=5, max_length=10)
    country: str = Field("US", min_length=2, max_length=2)
    is_default: bool = False


class UpdatePatientAddressRequest(BaseModel):
    label: str | None = Field(None, min_length=1, max_length=100)
    line1: str | None = Field(None, min_length=1)
    line2: str | None = None
    city: str | None = Field(None, min_length=1, max_length=100)
    state: str | None = Field(None, min_length=2, max_length=2)
    zip: str | None = Field(None, min_length=5, max_length=10)
    country: str | None = Field(None, min_length=2, max_length=2)
    is_default: bool | None = None


class PatientPaymentMethodInput(BaseModel):
    card_brand: str = Field(..., min_length=2, max_length=50)
    card_last4: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$")
    exp_month: int = Field(..., ge=1, le=12)
    exp_year: int = Field(..., ge=2024, le=2100)
    is_default: bool = False
