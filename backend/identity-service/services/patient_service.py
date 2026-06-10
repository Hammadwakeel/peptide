from __future__ import annotations

from fastapi import HTTPException

from auth_utils import generate_password, hash_password
from db import SessionLocal, connect
from email_service import send_credentials_email
from repository import find_user_by_email
from repository.patient_repository import accept_patient_invite, find_valid_invite
from repository.user_repository import create_user
from schemas.patient import AcceptInvitationRequest


def accept_invitation(body: AcceptInvitationRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        invite = find_valid_invite(cursor, body.token, body.doctor_id, body.email)
        if not invite:
            raise HTTPException(status_code=400, detail="Invalid or expired invitation")

        db = SessionLocal()
        try:
            existing_user = find_user_by_email(db, body.email)
        finally:
            db.close()

        if existing_user:
            raise HTTPException(status_code=409, detail="Email already registered")

        password = generate_password()
        user = create_user(
            cursor,
            body.email,
            hash_password(password),
            "patient",
            email_verified=True,
        )

        accept_patient_invite(
            cursor,
            str(invite["id"]),
            str(user["id"]),
            str(invite["patient_id"]),
        )

        send_credentials_email(body.email, password, "Patient")
        conn.commit()

        return {
            "status": True,
            "message": "Invitation accepted. Your password has been sent to your email.",
            "user": {
                "id": str(user["id"]),
                "email": user["email"],
                "role": user["role"],
            },
            "patient": {
                "id": str(invite["patient_id"]),
                "first_name": invite["first_name"],
                "last_name": invite["last_name"],
                "clinic_name": invite["clinic_name"],
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
