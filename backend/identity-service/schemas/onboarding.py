from pydantic import BaseModel, EmailStr, Field


class ClinicApplicationRequest(BaseModel):
    clinic_name: str = Field(..., min_length=2)
    npi_number: str = Field(..., min_length=1)
    dea_number: str = Field(..., min_length=1)
    state_license_number: str = Field(..., min_length=1)
    address1: str = Field(..., min_length=1)
    address2: str | None = None
    city: str = Field(..., min_length=1)
    state: str = Field(..., min_length=1)
    zip: str = Field(..., min_length=1)
    country: str = "US"
    phone: str = Field(..., min_length=1)
    primary_contact_name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=8)
    bank_name: str = Field(..., min_length=1)
    routing_number: str = Field(..., min_length=9, max_length=9)
    account_number: str = Field(..., min_length=4)
    account_type: str = Field("checking", pattern="^(checking|savings)$")
    affiliate_code: str | None = None
