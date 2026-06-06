from datetime import date

from pydantic import BaseModel, EmailStr, Field


class ClinicApplicationRequest(BaseModel):
    clinic_name: str = Field(..., min_length=2)
    email: EmailStr
    phone: str | None = None
    npi_number: str | None = None
    dea_number: str | None = None
    address1: str
    address2: str | None = None
    city: str
    state: str
    zip: str
    country: str = "US"
    affiliate_code: str | None = None


class InvitePatientRequest(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: EmailStr
    phone: str | None = None
    dob: date | None = None
