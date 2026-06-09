from pydantic import BaseModel, EmailStr, Field


class ClinicApplicationRequest(BaseModel):
    # Personal info
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: EmailStr
    phone: str = Field(..., min_length=1)

    # Clinic info
    clinic_name: str = Field(..., min_length=2)
    website: str = Field(..., min_length=1)
    tax_id: str = Field(..., min_length=1)
    address: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    state: str = Field(..., min_length=1)
    zip: str = Field(..., min_length=1)

    # Banking
    bank_name: str = Field(..., min_length=1)
    account_number: str = Field(..., min_length=4)
    account_type: str = Field("checking", pattern="^(checking|savings)$")

    # Affiliate + licenses
    affiliate_code: str | None = Field(
        None,
        min_length=8,
        max_length=8,
        pattern=r"^[A-Za-z0-9\-_!@#$*]{8}$",
    )
    npi_number: str | None = None
    dea_number: str | None = None
    state_license_number: str | None = None
    reseller_permit_number: str = Field(..., min_length=1)
