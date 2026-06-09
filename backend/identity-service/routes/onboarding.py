from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import ValidationError

from schemas.onboarding import ClinicApplicationRequest
from services import onboarding_service

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


def _parse_application_request(**data) -> ClinicApplicationRequest:
    try:
        return ClinicApplicationRequest(**data)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc


@router.post("/apply")
def apply_clinic(
    first_name: str = Form(..., examples=["Jane"]),
    last_name: str = Form(..., examples=["Smith"]),
    email: str = Form(..., examples=["clinic@example.com"]),
    phone: str = Form(..., examples=["555-0100"]),
    clinic_name: str = Form(..., min_length=2, examples=["ABC Wellness Clinic"]),
    website: str = Form(..., examples=["https://abcwellness.com"]),
    tax_id: str = Form(..., examples=["12-3456789"]),
    address: str = Form(..., examples=["123 Main St"]),
    city: str = Form(..., examples=["Austin"]),
    state: str = Form(..., examples=["TX"]),
    zip: str = Form(..., examples=["78701"]),
    bank_name: str = Form(..., examples=["Chase Bank"]),
    account_number: str = Form(..., min_length=4, examples=["123456789"]),
    account_type: str = Form("checking", examples=["checking"]),
    affiliate_code: str | None = Form(None, examples=["12345678"]),
    npi_number: str | None = Form(None, examples=["1234567890"]),
    dea_number: str | None = Form(None, examples=["AB1234567"]),
    state_license_number: str | None = Form(None, examples=["SL-998877"]),
    reseller_permit_number: str = Form(..., examples=["RP-12345"]),
) -> dict:
    """Public clinic onboarding — personal, clinic, banking, and license details.

    Affiliate code is optional. When provided it must be an 8-digit code.
    No password is collected here. Upload reseller permit + logo via
    POST /onboarding/documents after this step.
    """
    body = _parse_application_request(
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        clinic_name=clinic_name,
        website=website,
        tax_id=tax_id,
        address=address,
        city=city,
        state=state,
        zip=zip,
        bank_name=bank_name,
        account_number=account_number,
        account_type=account_type,
        affiliate_code=affiliate_code,
        npi_number=npi_number,
        dea_number=dea_number,
        state_license_number=state_license_number,
        reseller_permit_number=reseller_permit_number,
    )
    return onboarding_service.submit_application(body)


@router.post("/documents")
async def upload_documents(
    clinic_id: str = Form(...),
    reseller_permit: UploadFile = File(...),
    clinic_logo: UploadFile | None = File(None),
) -> dict:
    """Upload reseller permit document (PDF or image) and optional clinic logo."""
    return await onboarding_service.upload_documents(
        clinic_id,
        reseller_permit=reseller_permit,
        clinic_logo=clinic_logo,
    )
