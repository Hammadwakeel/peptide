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
    clinic_name: str = Form(..., min_length=2, examples=["ABC Wellness Clinic"]),
    npi_number: str = Form(..., examples=["1234567890"]),
    dea_number: str = Form(..., examples=["AB1234567"]),
    state_license_number: str = Form(..., examples=["SL-998877"]),
    address1: str = Form(..., examples=["123 Main St"]),
    address2: str | None = Form(None, examples=["Suite 200"]),
    city: str = Form(..., examples=["New York"]),
    state: str = Form(..., examples=["NY"]),
    zip: str = Form(..., examples=["10001"]),
    country: str = Form("US", examples=["US"]),
    phone: str = Form(..., examples=["555-0100"]),
    primary_contact_name: str = Form(..., examples=["Dr. Jane Smith"]),
    email: str = Form(..., examples=["clinic@example.com"]),
    password: str = Form(..., min_length=8, examples=["SecurePass123!"]),
    bank_name: str = Form(..., examples=["Chase Bank"]),
    routing_number: str = Form(..., min_length=9, max_length=9, examples=["021000021"]),
    account_number: str = Form(..., min_length=4, examples=["123456789"]),
    account_type: str = Form("checking", examples=["checking"]),
    affiliate_code: str | None = Form(None, examples=["REF123"]),
) -> dict:
    """Public clinic signup — practice info, credentials, and encrypted banking details."""
    body = _parse_application_request(
        clinic_name=clinic_name,
        npi_number=npi_number,
        dea_number=dea_number,
        state_license_number=state_license_number,
        address1=address1,
        address2=address2,
        city=city,
        state=state,
        zip=zip,
        country=country,
        phone=phone,
        primary_contact_name=primary_contact_name,
        email=email,
        password=password,
        bank_name=bank_name,
        routing_number=routing_number,
        account_number=account_number,
        account_type=account_type,
        affiliate_code=affiliate_code,
    )
    return onboarding_service.submit_application(body)


@router.post("/documents")
async def upload_documents(
    clinic_id: str = Form(...),
    dea_license: UploadFile | None = File(None),
    npi_certificate: UploadFile | None = File(None),
    state_license: UploadFile | None = File(None),
    business_registration: UploadFile | None = File(None),
    clinic_logo: UploadFile | None = File(None),
) -> dict:
    """Upload DEA, NPI, state license, business registration, and optional clinic logo to GCS."""
    return await onboarding_service.upload_documents(
        clinic_id,
        dea_license=dea_license,
        npi_certificate=npi_certificate,
        state_license=state_license,
        business_registration=business_registration,
        clinic_logo=clinic_logo,
    )
