from datetime import date

from pydantic import BaseModel, EmailStr, Field


class InvitePatientRequest(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: EmailStr
    phone: str | None = None
    dob: date | None = None
