from __future__ import annotations

from fastapi import HTTPException

from auth_utils import generate_affiliate_code, generate_password, hash_password
from db import connect
from email_service import (
    send_affiliate_credentials_email,
    send_application_approved_email,
    send_application_rejection_email,
    send_more_info_request_email,
    send_password_reset_email,
)
from repository import find_user_by_email
from repository.affiliate_repository import (
    activate_clinic_referral,
    count_all_affiliates,
    create_main_affiliate as db_create_main_affiliate,
    list_all_affiliates,
)
from repository.clinic_repository import (
    approve_clinic,
    count_all_clinics,
    count_applications,
    get_clinic_by_id,
    get_clinic_documents,
    link_clinic_owner,
    list_all_clinics,
    list_applications,
    reject_clinic,
    update_application_status,
)
from repository.patient_repository import (
    count_patients_by_clinic,
    get_patient_by_id,
    list_patients_by_clinic_admin,
)
from repository.user_repository import create_user, deactivate_user, get_user_by_id, update_user_password
from schemas.admin import (
    ChangePatientPasswordRequest,
    CreateAffiliateRequest,
    ReviewApplicationRequest,
)
from schemas.pagination import PaginationQuery, paginated_response

REVIEWABLE_STATUSES = ["submitted", "docs_signed", "pending_review", "more_info_requested"]


def _format_application(c: dict, documents: list[dict] | None = None) -> dict:
    return {
        "id": str(c["id"]),
        "clinic_name": c["clinic_name"],
        "email": c["email"],
        "phone": c.get("phone"),
        "primary_contact_name": c.get("primary_contact_name"),
        "npi_number": c.get("npi_number"),
        "dea_number": c.get("dea_number"),
        "state_license_number": c.get("state_license_number"),
        "status": c.get("status"),
        "application_status": c.get("application_status"),
        "rejection_reason": c.get("rejection_reason"),
        "admin_note": c.get("admin_note"),
        "address": {
            "address1": c.get("address1"),
            "address2": c.get("address2"),
            "city": c.get("city"),
            "state": c.get("state"),
            "zip": c.get("zip"),
            "country": c.get("country"),
        },
        "banking": {
            "bank_name": c.get("bank_name"),
            "account_type": c.get("account_type"),
            "routing_last4": c.get("routing_last4"),
            "account_last4": c.get("account_last4"),
        } if c.get("bank_name") else None,
        "logo_url": c.get("logo_url"),
        "documents": documents or [],
        "affiliate": {
            "id": str(c["affiliate_id"]) if c.get("affiliate_id") else None,
            "affiliate_code": c.get("affiliate_code"),
            "affiliate_type": c.get("affiliate_type"),
        } if c.get("affiliate_id") else None,
        "created_at": str(c["created_at"]),
    }


def _format_clinic(c: dict) -> dict:
    return {
        "id": str(c["id"]),
        "clinic_name": c["clinic_name"],
        "email": c["email"],
        "phone": c.get("phone"),
        "npi_number": c.get("npi_number"),
        "dea_number": c.get("dea_number"),
        "status": c["status"],
        "patient_count": c.get("patient_count", 0),
        "staff_count": c.get("staff_count", 0),
        "affiliate": {
            "id": str(c["affiliate_id"]) if c.get("affiliate_id") else None,
            "affiliate_code": c.get("affiliate_code"),
            "affiliate_type": c.get("affiliate_type"),
        } if c.get("affiliate_id") else None,
        "created_at": str(c["created_at"]),
    }


def list_applications_queue(
    pagination: PaginationQuery,
    status: str | None = None,
) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        status_filter = None
        if status:
            status_filter = [s.strip() for s in status.split(",") if s.strip()]
        elif status is None:
            status_filter = REVIEWABLE_STATUSES

        offset = (pagination.page - 1) * pagination.limit
        total = count_applications(cursor, status_filter)
        clinics = list_applications(cursor, pagination.limit, offset, status_filter)
        items = []
        for clinic in clinics:
            docs = get_clinic_documents(cursor, str(clinic["id"]))
            formatted_docs = [
                {
                    "id": str(d["id"]),
                    "document_type": d["document_type"],
                    "file_url": d["file_url"],
                    "status": d["status"],
                    "uploaded_at": str(d["uploaded_at"]),
                }
                for d in docs
            ]
            items.append(_format_application(clinic, formatted_docs))
        return paginated_response(items, total, pagination.page, pagination.limit, key="applications")
    finally:
        cursor.close()
        conn.close()


def review_application(application_id: str, body: ReviewApplicationRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = get_clinic_by_id(cursor, application_id)
        if not clinic:
            raise HTTPException(status_code=404, detail="Application not found")
        if clinic.get("application_status") not in REVIEWABLE_STATUSES:
            raise HTTPException(status_code=400, detail="Application is not pending review")

        if body.action == "reject":
            reject_clinic(cursor, application_id, body.rejection_reason)
            conn.commit()
            send_application_rejection_email(
                clinic["email"],
                clinic["clinic_name"],
                body.rejection_reason or "Application did not meet requirements.",
            )
            return {
                "status": True,
                "message": "Application rejected. Notification email sent.",
                "application_id": application_id,
                "application_status": "rejected",
                "email_sent_to": clinic["email"],
            }

        if body.action == "request_more_info":
            update_application_status(
                cursor,
                application_id,
                "more_info_requested",
                admin_note=body.admin_note,
            )
            conn.commit()
            send_more_info_request_email(
                clinic["email"],
                clinic["clinic_name"],
                body.admin_note or "",
            )
            return {
                "status": True,
                "message": "More information requested. Notification email sent.",
                "application_id": application_id,
                "application_status": "more_info_requested",
                "email_sent_to": clinic["email"],
            }

        if find_user_by_email(cursor, clinic["email"]):
            raise HTTPException(status_code=409, detail="User with clinic email already exists")

        password_hash = clinic.get("application_password_hash")
        if not password_hash:
            password = generate_password()
            password_hash = hash_password(password)
        else:
            password = None

        user = create_user(
            cursor,
            clinic["email"],
            password_hash,
            "clinic_owner",
            email_verified=True,
        )
        approve_clinic(cursor, application_id)
        link_clinic_owner(cursor, application_id, str(user["id"]))
        activate_clinic_referral(cursor, application_id)
        conn.commit()

        send_application_approved_email(
            clinic["email"],
            clinic["clinic_name"],
            password=password,
        )
        return {
            "status": True,
            "message": "Application approved. Approval email sent to clinic.",
            "application_id": application_id,
            "application_status": "approved",
            "email_sent_to": clinic["email"],
            "user": {
                "id": str(user["id"]),
                "email": user["email"],
                "role": user["role"],
            },
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


def list_clinics(pagination: PaginationQuery) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        offset = (pagination.page - 1) * pagination.limit
        total = count_all_clinics(cursor)
        clinics = list_all_clinics(cursor, pagination.limit, offset)
        items = [_format_clinic(c) for c in clinics]
        return paginated_response(items, total, pagination.page, pagination.limit, key="clinics")
    finally:
        cursor.close()
        conn.close()


def list_clinic_patients(clinic_id: str, pagination: PaginationQuery) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = get_clinic_by_id(cursor, clinic_id)
        if not clinic:
            raise HTTPException(status_code=404, detail="Clinic not found")

        offset = (pagination.page - 1) * pagination.limit
        total = count_patients_by_clinic(cursor, clinic_id)
        patients = list_patients_by_clinic_admin(cursor, clinic_id, pagination.limit, offset)

        items = [
            {
                "id": str(p["id"]),
                "first_name": p["first_name"],
                "last_name": p["last_name"],
                "email": p["email"],
                "phone": p.get("phone"),
                "status": p["status"],
                "has_account": p["user_id"] is not None,
                "user_id": str(p["user_id"]) if p.get("user_id") else None,
            }
            for p in patients
        ]
        response = paginated_response(items, total, pagination.page, pagination.limit, key="patients")
        response["clinic"] = {
            "id": str(clinic["id"]),
            "clinic_name": clinic["clinic_name"],
            "email": clinic["email"],
            "status": clinic["status"],
        }
        return response
    except HTTPException:
        raise
    finally:
        cursor.close()
        conn.close()


def _generate_unique_affiliate_code(cursor) -> str:
    from repository.clinic_repository import find_affiliate_by_code

    for _ in range(10):
        code = generate_affiliate_code()
        if not find_affiliate_by_code(cursor, code):
            return code
    raise HTTPException(status_code=500, detail="Could not generate unique affiliate code")


def create_affiliate(body: CreateAffiliateRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        if find_user_by_email(cursor, body.email):
            raise HTTPException(status_code=409, detail="Email already registered")

        affiliate_code = _generate_unique_affiliate_code(cursor)
        password = (
            body.password
            if body.password and not body.auto_generate_password
            else generate_password()
        )
        user = create_user(
            cursor,
            body.email,
            hash_password(password),
            "affiliate",
            email_verified=True,
        )
        affiliate = db_create_main_affiliate(cursor, str(user["id"]), affiliate_code)

        conn.commit()
        send_affiliate_credentials_email(
            body.email,
            password,
            affiliate["affiliate_code"],
            "main",
        )

        return {
            "status": True,
            "message": "Main affiliate created. Credentials sent to email.",
            "affiliate": {
                "id": str(affiliate["id"]),
                "email": user["email"],
                "affiliate_code": affiliate["affiliate_code"],
                "affiliate_type": "main",
            },
            "email_sent_to": body.email,
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


def list_affiliates(pagination: PaginationQuery) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        offset = (pagination.page - 1) * pagination.limit
        total = count_all_affiliates(cursor)
        affiliates = list_all_affiliates(cursor, pagination.limit, offset)
        items = [
            {
                "id": str(a["id"]),
                "email": a["email"],
                "affiliate_code": a["affiliate_code"],
                "affiliate_type": a["affiliate_type"],
                "status": a["status"],
                "parent_affiliate_code": a.get("parent_affiliate_code"),
                "clinic_referral_count": a.get("clinic_referral_count", 0),
                "created_at": str(a["created_at"]),
            }
            for a in affiliates
        ]
        return paginated_response(items, total, pagination.page, pagination.limit, key="affiliates")
    finally:
        cursor.close()
        conn.close()


def delete_user(user_id: str) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        user = get_user_by_id(cursor, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user["role"] in ("admin", "super_admin"):
            raise HTTPException(status_code=403, detail="Cannot delete admin accounts")

        deactivate_user(cursor, user_id)
        conn.commit()
        return {
            "status": True,
            "message": "User deactivated successfully",
            "user_id": user_id,
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


def change_patient_password(patient_id: str, body: ChangePatientPasswordRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        patient = get_patient_by_id(cursor, patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        if not patient.get("user_account_id"):
            raise HTTPException(status_code=400, detail="Patient has no user account yet")

        new_password = body.new_password if body.new_password and not body.auto_generate else generate_password()
        update_user_password(cursor, str(patient["user_account_id"]), hash_password(new_password))

        email = patient.get("user_email") or patient.get("email")
        if email:
            send_password_reset_email(email, new_password)

        conn.commit()
        return {
            "status": True,
            "message": "Patient password updated and emailed",
            "patient_id": patient_id,
            "email": email,
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
