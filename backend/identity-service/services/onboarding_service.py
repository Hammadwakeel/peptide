from __future__ import annotations

import os
import uuid

from fastapi import HTTPException, UploadFile

from db import SessionLocal, connect
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
from services.storage import public_url, s3
from services.upload_utils import ALLOWED_DOCUMENT_TYPES, ALLOWED_IMAGE_TYPES, read_upload


async def _upload_clinic_file(
    clinic_id: str,
    file: UploadFile | None,
    folder: str,
    allowed_types: set[str],
) -> str | None:
    if file is None or not file.filename:
        return None
    data, content_type = await read_upload(file, allowed_types)
    ext = os.path.splitext(file.filename)[1]
    key = f"{folder}/{clinic_id}/{uuid.uuid4().hex}{ext}"
    s3.upload_bytes(data, key, content_type=content_type)
    return public_url(key)


def submit_application(body: ClinicApplicationRequest) -> dict:
    db = SessionLocal()
    try:
        if find_user_by_email(db, body.email):
            raise HTTPException(status_code=409, detail="Email already registered")
    finally:
        db.close()

    conn = connect()
    cursor = conn.cursor()
    try:
        if find_clinic_by_email(cursor, body.email):
            raise HTTPException(status_code=409, detail="Clinic application already submitted")

        affiliate = None
        affiliate_code = (body.affiliate_code or "").strip()
        if affiliate_code:
            affiliate = find_affiliate_by_code(cursor, affiliate_code)
            if not affiliate:
                raise HTTPException(status_code=400, detail="Invalid affiliate code")

        clinic = create_clinic_application(cursor, {
            "first_name": body.first_name,
            "last_name": body.last_name,
            "clinic_name": body.clinic_name,
            "email": body.email,
            "phone": body.phone,
            "website": body.website,
            "tax_id": body.tax_id,
            "npi_number": body.npi_number,
            "dea_number": body.dea_number,
            "state_license_number": body.state_license_number,
            "reseller_permit_number": body.reseller_permit_number,
            "address1": body.address,
            "city": body.city,
            "state": body.state,
            "zip": body.zip,
            "application_status": "submitted",
            "affiliate_id": str(affiliate["id"]) if affiliate else None,
        })
        clinic_id = str(clinic["id"])

        save_clinic_banking(cursor, clinic_id, {
            "bank_name": body.bank_name,
            "account_type": body.account_type,
            "encrypted_routing": encrypt_value(""),
            "encrypted_account": encrypt_value(body.account_number),
            "routing_last4": "----",
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
                affiliate_code,
                status="pending",
            )

        conn.commit()
        result = {
            "status": True,
            "message": "Application submitted. Upload reseller permit and logo to complete onboarding.",
            "application": {
                "id": clinic_id,
                "clinic_name": clinic["clinic_name"],
                "email": clinic["email"],
                "first_name": body.first_name,
                "last_name": body.last_name,
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
    reseller_permit: UploadFile,
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

        permit_url = await _upload_clinic_file(
            clinic_id, reseller_permit, "clinic-documents/reseller-permit", ALLOWED_DOCUMENT_TYPES,
        )
        if not permit_url:
            raise HTTPException(status_code=400, detail="Reseller permit document is required")

        doc = insert_clinic_document(cursor, clinic_id, "reseller_permit", permit_url)
        uploaded_document = {
            "id": str(doc["id"]),
            "document_type": doc["document_type"],
            "file_url": doc["file_url"],
            "status": doc["status"],
        }

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
            "documents": [uploaded_document],
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
