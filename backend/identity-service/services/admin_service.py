from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException

from auth_utils import (
    generate_affiliate_code,
    generate_invite_token,
    generate_password,
    hash_password,
    hash_token,
)
from config import FRONTEND_URL, PASSWORD_SETUP_EXPIRY_HOURS
from db import SessionLocal, connect
from email_service import (
    send_application_rejection_email,
    send_more_info_request_email,
    send_password_reset_email,
    send_set_password_email,
)
from repository import find_user_by_email
from repository.affiliate_repository import (
    activate_clinic_referral,
    count_all_affiliates,
    create_main_affiliate as db_create_main_affiliate,
    get_affiliate_by_id,
    list_all_affiliates,
    update_affiliate_max_sub_affiliates as db_update_affiliate_max_sub_affiliates,
    update_affiliate_profit_margin as db_update_affiliate_profit_margin,
    update_sub_affiliates_profit_margin as db_update_sub_affiliates_profit_margin,
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
from repository.user_repository import (
    create_password_setup_token,
    create_user,
    deactivate_user,
    get_user_by_id,
    update_user_password,
)
from repository.platform_settings_repository import (
    get_platform_settings as db_get_platform_settings,
    update_platform_settings as db_update_platform_settings,
)
from schemas.admin import (
    ChangePatientPasswordRequest,
    CreateAffiliateRequest,
    ReviewApplicationRequest,
    UpdateAffiliateProfitMarginRequest,
    UpdateAffiliateSubAffiliateLimitRequest,
    UpdatePlatformSettingsRequest,
)
from schemas.pagination import PaginationQuery, paginated_response

REVIEWABLE_STATUSES = ["submitted", "docs_signed", "pending_review", "more_info_requested"]


def _issue_password_setup_link(cursor, user_id: str) -> str:
    raw_token = generate_invite_token()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=PASSWORD_SETUP_EXPIRY_HOURS)
    create_password_setup_token(cursor, user_id, hash_token(raw_token), expires_at)
    return f"{FRONTEND_URL}/set-password?token={raw_token}"


def _format_application(c: dict, documents: list[dict] | None = None) -> dict:
    return {
        "id": str(c["id"]),
        "clinic_name": c["clinic_name"],
        "email": c["email"],
        "phone": c.get("phone"),
        "first_name": c.get("first_name"),
        "last_name": c.get("last_name"),
        "website": c.get("website"),
        "tax_id": c.get("tax_id"),
        "reseller_permit_number": c.get("reseller_permit_number"),
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

        db = SessionLocal()
        try:
            if find_user_by_email(db, clinic["email"]):
                raise HTTPException(status_code=409, detail="User with clinic email already exists")
        finally:
            db.close()

        # Create the clinic owner account with an unusable random password and
        # unverified email. The owner sets their real password via a one-time
        # email link; until then the account cannot be logged into.
        placeholder_hash = hash_password(secrets.token_urlsafe(32))
        user = create_user(
            cursor,
            clinic["email"],
            placeholder_hash,
            "clinic_owner",
            email_verified=False,
        )
        approve_clinic(cursor, application_id)
        link_clinic_owner(cursor, application_id, str(user["id"]))
        activate_clinic_referral(cursor, application_id)

        setup_link = _issue_password_setup_link(cursor, str(user["id"]))
        conn.commit()

        send_set_password_email(
            clinic["email"],
            clinic["clinic_name"],
            setup_link,
            context="clinic",
        )
        return {
            "status": True,
            "message": "Application approved. A set-password email has been sent to the clinic.",
            "application_id": application_id,
            "application_status": "approved",
            "email_sent_to": clinic["email"],
            "setup_link": setup_link,
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


def _format_platform_settings(row: dict) -> dict:
    return {
        "default_profit_margin_percent": float(row["default_profit_margin_percent"]),
        "platform_commission_percent": float(row["platform_commission_percent"]),
        "affiliate_referral_fee_percent": float(row["affiliate_referral_fee_percent"]),
        "payout_frequency": row["payout_frequency"],
        "minimum_payout_threshold": float(row["minimum_payout_threshold"]),
        "default_shipping_rate": float(row["default_shipping_rate"]),
        "tax_calculation": row["tax_calculation"],
        "updated_at": str(row["updated_at"]),
    }


def get_platform_settings() -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        settings = db_get_platform_settings(cursor)
        return {
            "status": True,
            "settings": _format_platform_settings(settings),
        }
    finally:
        cursor.close()
        conn.close()


def update_platform_settings(body: UpdatePlatformSettingsRequest) -> dict:
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No settings provided to update")

    conn = connect()
    cursor = conn.cursor()
    try:
        settings = db_update_platform_settings(cursor, updates)
        conn.commit()
        return {
            "status": True,
            "message": "Platform settings updated.",
            "settings": _format_platform_settings(settings),
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


def _generate_unique_affiliate_code(cursor) -> str:
    from repository.clinic_repository import find_affiliate_by_code

    for _ in range(10):
        code = generate_affiliate_code()
        if not find_affiliate_by_code(cursor, code):
            return code
    raise HTTPException(status_code=500, detail="Could not generate unique affiliate code")


def create_affiliate(body: CreateAffiliateRequest) -> dict:
    db = SessionLocal()
    try:
        if find_user_by_email(db, body.email):
            raise HTTPException(status_code=409, detail="Email already registered")
    finally:
        db.close()

    conn = connect()
    cursor = conn.cursor()
    try:
        affiliate_code = _generate_unique_affiliate_code(cursor)
        placeholder_hash = hash_password(secrets.token_urlsafe(32))
        user = create_user(
            cursor,
            body.email,
            placeholder_hash,
            "affiliate",
            email_verified=False,
        )
        platform_settings = db_get_platform_settings(cursor)
        default_margin = float(platform_settings.get("default_profit_margin_percent") or 0)
        affiliate = db_create_main_affiliate(
            cursor,
            str(user["id"]),
            affiliate_code,
            profit_margin_percent=default_margin,
        )

        setup_link = _issue_password_setup_link(cursor, str(user["id"]))
        conn.commit()

        send_set_password_email(
            body.email,
            "Affiliate",
            setup_link,
            context="affiliate",
        )

        return {
            "status": True,
            "message": "Main affiliate created. A set-password email has been sent.",
            "affiliate": {
                "id": str(affiliate["id"]),
                "email": user["email"],
                "affiliate_code": affiliate["affiliate_code"],
                "affiliate_type": "main",
            },
            "email_sent_to": body.email,
            "setup_link": setup_link,
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
                "profit_margin_percent": float(a.get("profit_margin_percent") or 0),
                "max_sub_affiliates": a.get("max_sub_affiliates"),
                "sub_affiliate_count": int(a.get("sub_affiliate_count") or 0),
                "parent_affiliate_code": a.get("parent_affiliate_code"),
                "clinic_referral_count": int(a.get("clinic_referral_count") or 0),
                "created_at": str(a["created_at"]),
            }
            for a in affiliates
        ]
        return paginated_response(items, total, pagination.page, pagination.limit, key="affiliates")
    finally:
        cursor.close()
        conn.close()


def update_affiliate_profit_margin(
    affiliate_id: str,
    body: UpdateAffiliateProfitMarginRequest,
) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        existing = get_affiliate_by_id(cursor, affiliate_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Affiliate not found")
        if existing["affiliate_type"] == "sub":
            raise HTTPException(
                status_code=400,
                detail="Sub-affiliate profit margin is inherited from the main affiliate. Update the main affiliate instead.",
            )

        updated = db_update_affiliate_profit_margin(
            cursor,
            affiliate_id,
            body.profit_margin_percent,
        )
        subs_updated = db_update_sub_affiliates_profit_margin(
            cursor,
            affiliate_id,
            body.profit_margin_percent,
        )
        conn.commit()

        message = f"Profit margin updated for main affiliate."
        if subs_updated:
            message += f" {subs_updated} sub-affiliate(s) updated to match."

        return {
            "status": True,
            "message": message,
            "affiliate": {
                "id": str(updated["id"]),
                "email": existing["email"],
                "affiliate_code": updated["affiliate_code"],
                "affiliate_type": updated["affiliate_type"],
                "profit_margin_percent": float(updated["profit_margin_percent"]),
                "status": updated["status"],
            },
            "sub_affiliates_updated": subs_updated,
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


def update_affiliate_sub_affiliate_limit(
    affiliate_id: str,
    body: UpdateAffiliateSubAffiliateLimitRequest,
) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        existing = get_affiliate_by_id(cursor, affiliate_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Affiliate not found")
        if existing["affiliate_type"] != "main":
            raise HTTPException(
                status_code=400,
                detail="Sub-affiliate limit can only be set on main affiliates",
            )

        updated = db_update_affiliate_max_sub_affiliates(
            cursor,
            affiliate_id,
            body.max_sub_affiliates,
        )
        conn.commit()
        limit_label = (
            "unlimited"
            if body.max_sub_affiliates is None
            else str(body.max_sub_affiliates)
        )
        return {
            "status": True,
            "message": f"Sub-affiliate invite limit set to {limit_label}.",
            "affiliate": {
                "id": str(updated["id"]),
                "email": existing["email"],
                "affiliate_code": updated["affiliate_code"],
                "affiliate_type": updated["affiliate_type"],
                "max_sub_affiliates": updated["max_sub_affiliates"],
                "status": updated["status"],
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
