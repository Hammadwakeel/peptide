from __future__ import annotations

from fastapi import HTTPException

from auth_utils import generate_invite_token
from config import FRONTEND_URL, INVITE_EXPIRY_DAYS
from db import connect
from email_service import send_patient_invite_email
from repository import find_user_by_email
from repository.clinic_repository import get_doctor_clinic
from repository.patient_repository import (
    count_patients_by_clinic,
    create_patient,
    create_patient_invite,
    list_patients_by_clinic,
)
from schemas.doctor import InvitePatientRequest
from schemas.pagination import PaginationQuery, paginated_response


def invite_patient(doctor_user: dict, body: InvitePatientRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = get_doctor_clinic(cursor, doctor_user["sub"])
        if not clinic:
            raise HTTPException(status_code=403, detail="No clinic linked to this doctor account")
        if clinic["status"] != "active":
            raise HTTPException(status_code=403, detail="Clinic is not active yet")

        existing = find_user_by_email(cursor, body.email)
        if existing:
            raise HTTPException(status_code=409, detail="Email already has an account")

        patient = create_patient(cursor, {
            "clinic_id": str(clinic["id"]),
            **body.model_dump(),
        })

        raw_token = generate_invite_token()
        invite = create_patient_invite(
            cursor,
            str(patient["id"]),
            str(clinic["id"]),
            doctor_user["sub"],
            body.email,
            raw_token,
            INVITE_EXPIRY_DAYS,
        )

        invite_link = (
            f"{FRONTEND_URL}/accept-invitation"
            f"?token={raw_token}&doctor_id={doctor_user['sub']}"
        )

        doctor_name = doctor_user.get("email", "Your physician").split("@")[0]
        send_patient_invite_email(
            body.email,
            invite_link,
            doctor_name,
            clinic["clinic_name"],
        )

        conn.commit()
        return {
            "status": True,
            "message": "Patient invitation sent",
            "patient": {
                "id": str(patient["id"]),
                "first_name": patient["first_name"],
                "last_name": patient["last_name"],
                "email": patient["email"],
            },
            "invitation": {
                "id": str(invite["id"]),
                "invite_link": invite_link,
                "expires_at": str(invite["expires_at"]),
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


def list_my_patients(doctor_user: dict, pagination: PaginationQuery) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = get_doctor_clinic(cursor, doctor_user["sub"])
        if not clinic:
            raise HTTPException(status_code=403, detail="No clinic linked to this doctor account")

        offset = (pagination.page - 1) * pagination.limit
        total = count_patients_by_clinic(cursor, str(clinic["id"]))
        patients = list_patients_by_clinic(
            cursor, str(clinic["id"]), pagination.limit, offset,
        )

        items = [
            {
                "id": str(p["id"]),
                "first_name": p["first_name"],
                "last_name": p["last_name"],
                "email": p["email"],
                "phone": p["phone"],
                "status": p["status"],
                "has_account": p["user_id"] is not None,
                "email_verified": p.get("email_verified"),
            }
            for p in patients
        ]
        response = paginated_response(items, total, pagination.page, pagination.limit, key="patients")
        response["clinic_id"] = str(clinic["id"])
        response["clinic_name"] = clinic["clinic_name"]
        return response
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()
