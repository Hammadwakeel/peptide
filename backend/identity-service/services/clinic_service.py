from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, UploadFile

from auth_utils import generate_invite_token, hash_password, hash_token
from config import FRONTEND_URL, INVITE_EXPIRY_DAYS
from db import SessionLocal, connect
from email_service import send_clinic_member_invite_email
from repository import find_user_by_email
from repository.clinic_repository import (
    accept_clinic_invitation,
    add_clinic_member,
    cancel_clinic_invitation,
    create_clinic_invitation,
    find_clinic_invitation_by_token,
    find_pending_clinic_invitation,
    get_clinic_address,
    get_clinic_banking_summary,
    get_clinic_branding,
    get_clinic_by_id,
    get_clinic_member,
    get_clinic_settings,
    get_doctor_clinic,
    list_clinic_members,
    list_pending_clinic_invitations,
    save_clinic_banking,
    update_clinic_address,
    update_clinic_branding,
    update_clinic_member,
    update_clinic_profile,
    update_clinic_settings,
    upsert_clinic_branding_logo,
)
from repository.user_repository import create_user
from schemas.clinic import (
    AcceptClinicInvitationRequest,
    InviteClinicMemberRequest,
    UpdateClinicAddressRequest,
    UpdateClinicBankingRequest,
    UpdateClinicBrandingRequest,
    UpdateClinicMemberRequest,
    UpdateClinicProfileRequest,
    UpdateClinicSettingsRequest,
)
from services.clinic_permissions import (
    permissions_for_level,
    require_owner_or_admin,
    require_permission,
)
from services.encryption import encrypt_value
from services.onboarding_service import _upload_clinic_file
from services.upload_utils import ALLOWED_IMAGE_TYPES


def _membership_context(cursor, user: dict) -> dict:
    membership = get_doctor_clinic(cursor, user["sub"])
    if not membership:
        raise HTTPException(status_code=403, detail="No clinic linked to this account")
    if membership["status"] != "active":
        raise HTTPException(status_code=403, detail="Clinic is not active yet")
    membership["permissions"] = permissions_for_level(membership["access_level"])
    return membership


def _format_profile(cursor, clinic_id: str, membership: dict) -> dict:
    clinic = get_clinic_by_id(cursor, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")

    address = get_clinic_address(cursor, clinic_id)
    branding = get_clinic_branding(cursor, clinic_id)
    banking = get_clinic_banking_summary(cursor, clinic_id)
    settings = get_clinic_settings(cursor, clinic_id)

    return {
        "status": True,
        "clinic": {
            "id": str(clinic["id"]),
            "clinic_name": clinic["clinic_name"],
            "email": clinic["email"],
            "phone": clinic.get("phone"),
            "website": clinic.get("website"),
            "npi_number": clinic.get("npi_number"),
            "dea_number": clinic.get("dea_number"),
            "state_license_number": clinic.get("state_license_number"),
            "tax_id": clinic.get("tax_id"),
            "first_name": clinic.get("first_name"),
            "last_name": clinic.get("last_name"),
            "status": clinic.get("status"),
        },
        "address": {
            "address1": address["address1"],
            "address2": address.get("address2"),
            "city": address["city"],
            "state": address["state"],
            "zip": address["zip"],
            "country": address.get("country", "US"),
        } if address else None,
        "branding": {
            "logo_url": branding.get("logo_url") if branding else None,
            "tagline": branding.get("tagline") if branding else None,
            "theme_color": branding.get("theme_color") if branding else "#1a365d",
        },
        "banking": {
            "bank_name": banking["bank_name"],
            "account_type": banking["account_type"],
            "routing_last4": banking["routing_last4"],
            "account_last4": banking["account_last4"],
        } if banking else None,
        "settings": {
            "notification_email": settings.get("notification_email", True),
            "notification_sms": settings.get("notification_sms", False),
            "auto_approve_requests": settings.get("auto_approve_requests", False),
            "payout_schedule_days": settings.get("payout_schedule_days", 3),
            "timezone": settings.get("timezone", "America/New_York"),
        } if settings else {
            "notification_email": True,
            "notification_sms": False,
            "auto_approve_requests": False,
            "payout_schedule_days": 3,
            "timezone": "America/New_York",
        },
        "membership": {
            "access_level": membership["access_level"],
            "permissions": membership["permissions"],
        },
    }


def get_clinic_profile(user: dict) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        membership = _membership_context(cursor, user)
        require_permission(membership, "view_clinic")
        return _format_profile(cursor, str(membership["id"]), membership)
    finally:
        cursor.close()
        conn.close()


def update_profile(user: dict, body: UpdateClinicProfileRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        membership = _membership_context(cursor, user)
        require_permission(membership, "edit_clinic")
        update_clinic_profile(cursor, str(membership["id"]), body.model_dump(exclude_unset=True))
        conn.commit()
        return _format_profile(cursor, str(membership["id"]), membership)
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


def update_address(user: dict, body: UpdateClinicAddressRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        membership = _membership_context(cursor, user)
        require_permission(membership, "edit_clinic")
        update_clinic_address(cursor, str(membership["id"]), body.model_dump())
        conn.commit()
        return _format_profile(cursor, str(membership["id"]), membership)
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


def update_banking(user: dict, body: UpdateClinicBankingRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        membership = _membership_context(cursor, user)
        require_permission(membership, "edit_banking")
        clinic_id = str(membership["id"])
        save_clinic_banking(cursor, clinic_id, {
            "bank_name": body.bank_name,
            "account_type": body.account_type,
            "encrypted_routing": encrypt_value(body.routing_number),
            "encrypted_account": encrypt_value(body.account_number),
            "routing_last4": body.routing_number[-4:],
            "account_last4": body.account_number[-4:],
        })
        conn.commit()
        return _format_profile(cursor, clinic_id, membership)
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


def update_branding(user: dict, body: UpdateClinicBrandingRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        membership = _membership_context(cursor, user)
        require_permission(membership, "edit_branding")
        clinic_id = str(membership["id"])
        update_clinic_branding(cursor, clinic_id, body.model_dump(exclude_unset=True))
        conn.commit()
        return _format_profile(cursor, clinic_id, membership)
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


async def upload_logo(user: dict, logo: UploadFile) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        membership = _membership_context(cursor, user)
        require_permission(membership, "edit_branding")
        clinic_id = str(membership["id"])
        logo_url = await _upload_clinic_file(clinic_id, logo, "clinic-logos", ALLOWED_IMAGE_TYPES)
        if not logo_url:
            raise HTTPException(status_code=400, detail="Logo file is required")
        upsert_clinic_branding_logo(cursor, clinic_id, logo_url)
        conn.commit()
        return _format_profile(cursor, clinic_id, membership)
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


def update_settings(user: dict, body: UpdateClinicSettingsRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        membership = _membership_context(cursor, user)
        require_permission(membership, "edit_settings")
        clinic_id = str(membership["id"])
        update_clinic_settings(cursor, clinic_id, body.model_dump(exclude_unset=True))
        conn.commit()
        return _format_profile(cursor, clinic_id, membership)
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


def _format_member(row: dict, *, pending: bool = False) -> dict:
    if pending:
        return {
            "id": str(row["id"]),
            "email": row["email"],
            "access_level": row["access_level"],
            "status": "pending",
            "is_active": False,
            "name": row["email"].split("@")[0],
            "expires_at": str(row["expires_at"]),
        }
    name = row["email"].split("@")[0]
    return {
        "id": str(row["id"]),
        "user_id": str(row["user_id"]),
        "email": row["email"],
        "access_level": row["access_level"],
        "status": "active" if row["is_active"] and row.get("user_status") == "active" else "inactive",
        "is_active": bool(row["is_active"]),
        "name": name,
    }


def list_members(user: dict) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        membership = _membership_context(cursor, user)
        require_permission(membership, "view_clinic")
        clinic_id = str(membership["id"])
        members = [_format_member(m) for m in list_clinic_members(cursor, clinic_id)]
        pending = [
            _format_member(inv, pending=True)
            for inv in list_pending_clinic_invitations(cursor, clinic_id)
        ]
        return {
            "status": True,
            "members": members,
            "pending_invitations": pending,
            "membership": {
                "access_level": membership["access_level"],
                "permissions": membership["permissions"],
            },
        }
    finally:
        cursor.close()
        conn.close()


def invite_member(user: dict, body: InviteClinicMemberRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        membership = _membership_context(cursor, user)
        require_permission(membership, "manage_members")
        clinic_id = str(membership["id"])

        db = SessionLocal()
        try:
            existing_user = find_user_by_email(db, body.email)
        finally:
            db.close()

        if existing_user:
            cursor.execute(
                """
                SELECT cu.id FROM clinic_users cu
                WHERE cu.clinic_id = %s AND cu.user_id = %s
                """,
                (clinic_id, str(existing_user.id)),
            )
            if cursor.fetchone():
                raise HTTPException(status_code=409, detail="User is already a clinic member")

        if find_pending_clinic_invitation(cursor, clinic_id, body.email):
            raise HTTPException(status_code=409, detail="An invitation is already pending for this email")

        raw_token = generate_invite_token()
        expires_at = datetime.now(timezone.utc) + timedelta(days=INVITE_EXPIRY_DAYS)
        invitation = create_clinic_invitation(
            cursor,
            clinic_id,
            body.email,
            body.access_level,
            user["sub"],
            hash_token(raw_token),
            expires_at,
        )

        clinic = get_clinic_by_id(cursor, clinic_id)
        invite_link = f"{FRONTEND_URL}/accept-clinic-invitation?token={raw_token}"
        send_clinic_member_invite_email(
            body.email,
            invite_link,
            clinic["clinic_name"] if clinic else "your clinic",
            body.access_level,
        )

        conn.commit()
        return {
            "status": True,
            "message": "Organization member invitation sent.",
            "invitation": _format_member(invitation, pending=True),
            "invite_link": invite_link,
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


def update_member(user: dict, member_id: str, body: UpdateClinicMemberRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        membership = _membership_context(cursor, user)
        require_permission(membership, "manage_members")
        clinic_id = str(membership["id"])

        member = get_clinic_member(cursor, clinic_id, member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        if member["access_level"] == "owner":
            raise HTTPException(status_code=403, detail="Cannot modify the clinic owner")
        if membership["access_level"] == "admin" and member["access_level"] == "admin":
            raise HTTPException(status_code=403, detail="Admins cannot modify other admins")

        updated = update_clinic_member(
            cursor,
            clinic_id,
            member_id,
            access_level=body.access_level,
            is_active=body.is_active,
        )
        conn.commit()
        return {
            "status": True,
            "message": "Member updated.",
            "member": {
                "id": str(updated["id"]),
                "access_level": updated["access_level"],
                "is_active": updated["is_active"],
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


def remove_member(user: dict, member_id: str) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        membership = _membership_context(cursor, user)
        require_owner_or_admin(membership)
        clinic_id = str(membership["id"])

        member = get_clinic_member(cursor, clinic_id, member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        if member["access_level"] == "owner":
            raise HTTPException(status_code=403, detail="Cannot remove the clinic owner")
        if str(member["user_id"]) == user["sub"]:
            raise HTTPException(status_code=403, detail="Cannot remove yourself")

        update_clinic_member(cursor, clinic_id, member_id, is_active=False)
        conn.commit()
        return {"status": True, "message": "Member removed from organization."}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


def cancel_invitation(user: dict, invitation_id: str) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        membership = _membership_context(cursor, user)
        require_permission(membership, "manage_members")
        if not cancel_clinic_invitation(cursor, str(membership["id"]), invitation_id):
            raise HTTPException(status_code=404, detail="Pending invitation not found")
        conn.commit()
        return {"status": True, "message": "Invitation cancelled."}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


def accept_invitation(body: AcceptClinicInvitationRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        invitation = find_clinic_invitation_by_token(cursor, hash_token(body.token))
        if not invitation:
            raise HTTPException(status_code=400, detail="Invalid invitation link")
        if invitation["status"] != "pending":
            raise HTTPException(status_code=409, detail="Invitation is no longer valid")
        expires = invitation["expires_at"]
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if expires <= datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Invitation has expired")

        db = SessionLocal()
        try:
            existing = find_user_by_email(db, invitation["email"])
        finally:
            db.close()

        if existing:
            raise HTTPException(
                status_code=409,
                detail="An account with this email already exists. Contact your clinic admin.",
            )

        new_user = create_user(
            cursor,
            invitation["email"],
            hash_password(body.password),
            "clinic_staff",
            email_verified=True,
            status="active",
        )
        add_clinic_member(
            cursor,
            str(invitation["clinic_id"]),
            str(new_user["id"]),
            invitation["access_level"],
        )
        accept_clinic_invitation(cursor, str(invitation["id"]))
        conn.commit()

        return {
            "status": True,
            "message": "Invitation accepted. You can now log in.",
            "login_url": f"{FRONTEND_URL}/login",
            "clinic_name": invitation["clinic_name"],
            "access_level": invitation["access_level"],
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
