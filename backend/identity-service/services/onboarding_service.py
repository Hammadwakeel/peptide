from __future__ import annotations

from fastapi import HTTPException, UploadFile

from auth_utils import hash_password
from db import connect
from repository import find_user_by_email
from repository.affiliate_repository import create_clinic_referral, resolve_affiliate_chain
from repository.clinic_repository import (
    create_clinic_application,
    find_affiliate_by_code,
    find_clinic_by_email,
    get_clinic_by_id,
    insert_clinic_document,
    save_clinic_banking,
    update_application_status,
    upsert_clinic_branding_logo,
)
from schemas.onboarding import ClinicApplicationRequest
from services.encryption import encrypt_value
from services.gcs_storage import gcs
from services.upload_utils import ALLOWED_DOCUMENT_TYPES, ALLOWED_IMAGE_TYPES, read_upload

CLINIC_DOCUMENT_UPLOADS = {
    "dea_license": ("clinic-documents/dea-license", ALLOWED_DOCUMENT_TYPES),
    "npi_certificate": ("clinic-documents/npi-certificate", ALLOWED_DOCUMENT_TYPES),
    "state_license": ("clinic-documents/state-license", ALLOWED_DOCUMENT_TYPES),
    "business_registration": ("clinic-documents/business-registration", ALLOWED_DOCUMENT_TYPES),
}


async def _upload_clinic_file(
    clinic_id: str,
    file: UploadFile | None,
    folder: str,
    allowed_types: set[str],
) -> str | None:
    if file is None or not file.filename:
        return None
    data, content_type = await read_upload(file, allowed_types)
    result = gcs.upload_bytes(
        data,
        filename=file.filename,
        folder=f"{folder}/{clinic_id}",
        content_type=content_type,
        make_public=True,
    )
    return result["url"]


def submit_application(body: ClinicApplicationRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        if find_user_by_email(cursor, body.email):
            raise HTTPException(status_code=409, detail="Email already registered")

        if find_clinic_by_email(cursor, body.email):
            raise HTTPException(status_code=409, detail="Clinic application already submitted")

        affiliate = None
        if body.affiliate_code:
            affiliate = find_affiliate_by_code(cursor, body.affiliate_code)
            if not affiliate:
                raise HTTPException(status_code=400, detail="Invalid affiliate code")

        clinic = create_clinic_application(cursor, {
            "clinic_name": body.clinic_name,
            "email": body.email,
            "phone": body.phone,
            "npi_number": body.npi_number,
            "dea_number": body.dea_number,
            "primary_contact_name": body.primary_contact_name,
            "state_license_number": body.state_license_number,
            "address1": body.address1,
            "address2": body.address2,
            "city": body.city,
            "state": body.state,
            "zip": body.zip,
            "country": body.country,
            "application_status": "submitted",
            "application_password_hash": hash_password(body.password),
            "affiliate_id": str(affiliate["id"]) if affiliate else None,
        })
        clinic_id = str(clinic["id"])

        save_clinic_banking(cursor, clinic_id, {
            "bank_name": body.bank_name,
            "account_type": body.account_type,
            "encrypted_routing": encrypt_value(body.routing_number),
            "encrypted_account": encrypt_value(body.account_number),
            "routing_last4": body.routing_number[-4:],
            "account_last4": body.account_number[-4:],
        })

        referral = None
        if affiliate:
            referring_id, main_id = resolve_affiliate_chain(cursor, affiliate)
            referral = create_clinic_referral(
                cursor,
                clinic_id,
                referring_id,
                main_id,
                body.affiliate_code,
                status="pending",
            )

        conn.commit()
        result = {
            "status": True,
            "message": "Application submitted. Upload required documents to complete onboarding.",
            "application": {
                "id": clinic_id,
                "clinic_name": clinic["clinic_name"],
                "email": clinic["email"],
                "primary_contact_name": body.primary_contact_name,
                "application_status": clinic["application_status"],
            },
        }
        if referral:
            result["affiliate_referral"] = {
                "referring_affiliate_id": str(referral["referring_affiliate_id"]),
                "main_affiliate_id": str(referral["main_affiliate_id"]),
                "referral_code": referral["referral_code"],
                "status": referral["status"],
            }
        return result
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


async def upload_documents(
    clinic_id: str,
    dea_license: UploadFile | None = None,
    npi_certificate: UploadFile | None = None,
    state_license: UploadFile | None = None,
    business_registration: UploadFile | None = None,
    clinic_logo: UploadFile | None = None,
) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = get_clinic_by_id(cursor, clinic_id)
        if not clinic:
            raise HTTPException(status_code=404, detail="Application not found")

        if clinic.get("application_status") in ("approved", "rejected"):
            raise HTTPException(status_code=400, detail="Application is no longer accepting documents")

        allowed_upload_statuses = {"submitted", "docs_signed", "pending_review", "more_info_requested"}
        if clinic.get("application_status") not in allowed_upload_statuses:
            raise HTTPException(status_code=400, detail="Application is not accepting documents")

        logo_url = await _upload_clinic_file(
            clinic_id, clinic_logo, "clinic-logos", ALLOWED_IMAGE_TYPES,
        )
        if logo_url:
            upsert_clinic_branding_logo(cursor, clinic_id, logo_url)

        uploaded_documents = []
        document_files = {
            "dea_license": dea_license,
            "npi_certificate": npi_certificate,
            "state_license": state_license,
            "business_registration": business_registration,
        }
        for document_type, upload_file in document_files.items():
            folder, allowed_types = CLINIC_DOCUMENT_UPLOADS[document_type]
            file_url = await _upload_clinic_file(clinic_id, upload_file, folder, allowed_types)
            if file_url:
                doc = insert_clinic_document(cursor, clinic_id, document_type, file_url)
                uploaded_documents.append({
                    "id": str(doc["id"]),
                    "document_type": doc["document_type"],
                    "file_url": doc["file_url"],
                    "status": doc["status"],
                })

        if not uploaded_documents and not logo_url:
            raise HTTPException(status_code=400, detail="At least one document or logo file is required")

        update_application_status(cursor, clinic_id, "pending_review")
        conn.commit()

        return {
            "status": True,
            "message": "Documents uploaded. Application is pending admin review.",
            "application": {
                "id": clinic_id,
                "application_status": "pending_review",
                "logo_url": logo_url,
            },
            "documents": uploaded_documents,
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()
