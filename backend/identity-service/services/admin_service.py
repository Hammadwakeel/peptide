from __future__ import annotations

from fastapi import HTTPException

from auth_utils import generate_password, hash_password
from db import connect
from email_service import send_credentials_email, send_password_reset_email
from repository import find_user_by_email
from repository.affiliate_repository import (
    activate_clinic_referral,
    create_main_affiliate as db_create_main_affiliate,
    get_main_affiliate,
)
from repository.clinic_repository import (
    approve_clinic,
    count_all_clinics,
    count_pending_clinics,
    get_clinic_by_id,
    link_clinic_owner,
    list_all_clinics,
    list_pending_clinics,
    reject_clinic,
)
from repository.patient_repository import (
    count_patients_by_clinic,
    get_patient_by_id,
    list_patients_by_clinic_admin,
)
from repository.user_repository import create_user, deactivate_user, get_user_by_id, update_user_password
from schemas.admin import ChangePatientPasswordRequest, CreateMainAffiliateRequest, ReviewClinicRequest
from schemas.pagination import PaginationQuery, paginated_response


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


def list_pending_applications(pagination: PaginationQuery) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        offset = (pagination.page - 1) * pagination.limit
        total = count_pending_clinics(cursor)
        clinics = list_pending_clinics(cursor, pagination.limit, offset)
        items = [
            {
                "id": str(c["id"]),
                "clinic_name": c["clinic_name"],
                "email": c["email"],
                "phone": c.get("phone"),
                "npi_number": c.get("npi_number"),
                "dea_number": c.get("dea_number"),
                "status": c["status"],
                "address": {
                    "address1": c.get("address1"),
                    "city": c.get("city"),
                    "state": c.get("state"),
                    "zip": c.get("zip"),
                },
                "affiliate": {
                    "id": str(c["affiliate_id"]) if c.get("affiliate_id") else None,
                    "affiliate_code": c.get("affiliate_code"),
                    "affiliate_type": c.get("affiliate_type"),
                } if c.get("affiliate_id") else None,
                "created_at": str(c["created_at"]),
            }
            for c in clinics
        ]
        return paginated_response(items, total, pagination.page, pagination.limit, key="applications")
    finally:
        cursor.close()
        conn.close()


def review_clinic(clinic_id: str, body: ReviewClinicRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = get_clinic_by_id(cursor, clinic_id)
        if not clinic:
            raise HTTPException(status_code=404, detail="Clinic not found")
        if clinic["status"] != "pending":
            raise HTTPException(status_code=400, detail="Clinic is not pending review")

        if not body.approve:
            reject_clinic(cursor, clinic_id)
            conn.commit()
            return {
                "status": True,
                "message": "Clinic application rejected",
                "clinic_id": clinic_id,
            }

        if find_user_by_email(cursor, clinic["email"]):
            raise HTTPException(status_code=409, detail="User with clinic email already exists")

        password = generate_password()
        user = create_user(
            cursor,
            clinic["email"],
            hash_password(password),
            "clinic_owner",
            email_verified=True,
        )
        approve_clinic(cursor, clinic_id)
        link_clinic_owner(cursor, clinic_id, str(user["id"]))
        activate_clinic_referral(cursor, clinic_id)

        send_credentials_email(clinic["email"], password, "Clinic / Doctor")
        conn.commit()

        return {
            "status": True,
            "message": "Clinic approved. Credentials sent to clinic email.",
            "clinic_id": clinic_id,
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


def create_main_affiliate(body: CreateMainAffiliateRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        if get_main_affiliate(cursor):
            raise HTTPException(status_code=409, detail="Main affiliate already exists. Only one is allowed.")

        if find_user_by_email(cursor, body.email):
            raise HTTPException(status_code=409, detail="Email already registered")

        from repository.clinic_repository import find_affiliate_by_code
        if find_affiliate_by_code(cursor, body.affiliate_code):
            raise HTTPException(status_code=409, detail="Affiliate code already taken")

        password = generate_password()
        user = create_user(
            cursor,
            body.email,
            hash_password(password),
            "affiliate",
            email_verified=True,
        )
        affiliate = db_create_main_affiliate(cursor, str(user["id"]), body.affiliate_code)

        send_credentials_email(body.email, password, "Main Affiliate")
        conn.commit()

        return {
            "status": True,
            "message": "Main affiliate created. Credentials sent to email.",
            "affiliate": {
                "id": str(affiliate["id"]),
                "email": user["email"],
                "affiliate_code": affiliate["affiliate_code"],
                "affiliate_type": "main",
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
