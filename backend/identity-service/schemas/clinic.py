from pydantic import BaseModel, EmailStr, Field


VALID_ACCESS_LEVELS = frozenset({"owner", "admin", "staff", "associate_provider"})
INVITABLE_ACCESS_LEVELS = frozenset({"admin", "staff", "associate_provider"})


class UpdateClinicProfileRequest(BaseModel):
    clinic_name: str | None = Field(None, min_length=2)
    phone: str | None = None
    website: str | None = None
    npi_number: str | None = None
    dea_number: str | None = None
    state_license_number: str | None = None
    tax_id: str | None = None
    first_name: str | None = None
    last_name: str | None = None


class UpdateClinicAddressRequest(BaseModel):
    address1: str = Field(..., min_length=1)
    address2: str | None = None
    city: str = Field(..., min_length=1)
    state: str = Field(..., min_length=1)
    zip: str = Field(..., min_length=1)
    country: str = Field("US", min_length=2)


class UpdateClinicBrandingRequest(BaseModel):
    tagline: str | None = None
    theme_color: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")


class UpdateClinicBankingRequest(BaseModel):
    bank_name: str = Field(..., min_length=1)
    account_type: str = Field("checking", pattern="^(checking|savings)$")
    routing_number: str = Field(..., min_length=9, max_length=9)
    account_number: str = Field(..., min_length=4)


class UpdateClinicSettingsRequest(BaseModel):
    notification_email: bool | None = None
    notification_sms: bool | None = None
    auto_approve_requests: bool | None = None
    payout_schedule_days: int | None = Field(None, ge=1, le=90)
    timezone: str | None = None


class InviteClinicMemberRequest(BaseModel):
    email: EmailStr
    access_level: str = Field("staff", pattern="^(admin|staff|associate_provider)$")


class UpdateClinicMemberRequest(BaseModel):
    access_level: str | None = Field(None, pattern="^(admin|staff|associate_provider)$")
    is_active: bool | None = None


class AcceptClinicInvitationRequest(BaseModel):
    token: str = Field(..., min_length=1)
    password: str = Field(..., min_length=8)
    first_name: str | None = Field(None, min_length=1)
    last_name: str | None = Field(None, min_length=1)
