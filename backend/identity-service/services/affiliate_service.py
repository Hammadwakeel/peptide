from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException

from auth_utils import (
    generate_affiliate_code,
    generate_invite_token,
    hash_password,
    hash_token,
)
from config import FRONTEND_URL, PASSWORD_SETUP_EXPIRY_HOURS
from db import SessionLocal, connect
from email_service import send_clinic_referral_invite_email, send_set_password_email
from repository import find_user_by_email
from repository.affiliate_repository import (
    count_clinic_referrals,
    count_sub_affiliates,
    create_sub_affiliate,
    get_affiliate_by_user_id,
    list_clinic_referrals as db_list_clinic_referrals,
    list_sub_affiliates as db_list_sub_affiliates,
)
from repository.clinic_repository import find_affiliate_by_code
from repository.user_repository import create_password_setup_token, create_user
from schemas.affiliate import InviteClinicRequest, InviteSubAffiliateRequest
from schemas.pagination import PaginationQuery, paginated_response


def _build_referral_link(affiliate_code: str) -> str:
    return f"{FRONTEND_URL}/apply?ref={affiliate_code}"


def _issue_password_setup_link(cursor, user_id: str) -> str:
    raw_token = generate_invite_token()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=PASSWORD_SETUP_EXPIRY_HOURS)
    create_password_setup_token(cursor, user_id, hash_token(raw_token), expires_at)
    return f"{FRONTEND_URL}/set-password?token={raw_token}"


def _require_main_affiliate(cursor, user: dict) -> dict:
    affiliate = get_affiliate_by_user_id(cursor, user["sub"])
    if not affiliate:
        raise HTTPException(status_code=404, detail="Affiliate profile not found")
    if affiliate["affiliate_type"] != "main":
        raise HTTPException(status_code=403, detail="Only the main affiliate can perform this action")
    return affiliate


def get_clinic_invite_link(user: dict) -> dict:
    """Return the affiliate's clinic application link — no email, link only."""
    conn = connect()
    cursor = conn.cursor()
    try:
        affiliate = get_affiliate_by_user_id(cursor, user["sub"])
        if not affiliate:
            raise HTTPException(status_code=404, detail="Affiliate profile not found")
        if affiliate["status"] != "active":
            raise HTTPException(status_code=403, detail="Affiliate account is not active")

        referral_code = affiliate["affiliate_code"]
        return {
            "status": True,
            "referral_code": referral_code,
            "referral_link": _build_referral_link(referral_code),
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


def _check_sub_affiliate_limit(cursor, main_affiliate: dict) -> None:
    max_sub_affiliates = main_affiliate.get("max_sub_affiliates")
    if max_sub_affiliates is None:
        return
    current = count_sub_affiliates(cursor, str(main_affiliate["id"]))
    if current >= max_sub_affiliates:
        raise HTTPException(
            status_code=403,
            detail=f"Sub-affiliate limit reached ({max_sub_affiliates}). Contact admin to increase your limit.",
        )


def _generate_unique_sub_code(cursor) -> str:
    for _ in range(10):
        code = generate_affiliate_code()
        if not find_affiliate_by_code(cursor, code):
            return code
    raise HTTPException(status_code=500, detail="Could not generate unique affiliate code")


def invite_clinic(user: dict, body: InviteClinicRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        affiliate = get_affiliate_by_user_id(cursor, user["sub"])
        if not affiliate:
            raise HTTPException(status_code=404, detail="Affiliate profile not found")
        if affiliate["status"] != "active":
            raise HTTPException(status_code=403, detail="Affiliate account is not active")

        referral_code = affiliate["affiliate_code"]
        referral_link = _build_referral_link(referral_code)

        email_sent_to = None
        if body.clinic_email:
            send_clinic_referral_invite_email(body.clinic_email, referral_code, referral_link)
            email_sent_to = body.clinic_email

        return {
            "status": True,
            "message": "Clinic invitation link created."
            + (" Invitation email sent." if email_sent_to else ""),
            "referral_code": referral_code,
            "referral_link": referral_link,
            "email_sent_to": email_sent_to,
            "affiliate_type": affiliate["affiliate_type"],
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


def invite_sub_affiliate(user: dict, body: InviteSubAffiliateRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        main_affiliate = _require_main_affiliate(cursor, user)
        _check_sub_affiliate_limit(cursor, main_affiliate)

        db = SessionLocal()
        try:
            if find_user_by_email(db, body.email):
                raise HTTPException(status_code=409, detail="Email already registered")
        finally:
            db.close()

        code = _generate_unique_sub_code(cursor)

        placeholder_hash = hash_password(secrets.token_urlsafe(32))
        new_user = create_user(
            cursor,
            body.email,
            placeholder_hash,
            "affiliate",
            email_verified=False,
            status="inactive",
        )
        sub = create_sub_affiliate(
            cursor,
            str(new_user["id"]),
            code,
            str(main_affiliate["id"]),
            profit_margin_percent=float(main_affiliate.get("profit_margin_percent") or 0),
        )

        setup_link = _issue_password_setup_link(cursor, str(new_user["id"]))
        conn.commit()

        send_set_password_email(body.email, "Sub-Affiliate", setup_link, context="affiliate")

        return {
            "status": True,
            "message": "Sub-affiliate invited. A set-password email has been sent.",
            "sub_affiliate": {
                "id": str(sub["id"]),
                "email": new_user["email"],
                "affiliate_code": sub["affiliate_code"],
                "parent_affiliate_id": str(main_affiliate["id"]),
                "affiliate_type": "sub",
                "status": sub["status"],
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


def list_sub_affiliates(user: dict, pagination: PaginationQuery) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        main_affiliate = _require_main_affiliate(cursor, user)
        offset = (pagination.page - 1) * pagination.limit
        total = count_sub_affiliates(cursor, str(main_affiliate["id"]))
        rows = db_list_sub_affiliates(cursor, str(main_affiliate["id"]), pagination.limit, offset)

        items = [
            {
                "id": str(r["id"]),
                "email": r["email"],
                "affiliate_code": r["affiliate_code"],
                "status": r["status"],
                "profit_margin_percent": float(r.get("profit_margin_percent") or 0),
                "clinic_referral_count": r["clinic_referral_count"],
                "created_at": str(r["created_at"]),
            }
            for r in rows
        ]
        return paginated_response(items, total, pagination.page, pagination.limit, key="sub_affiliates")
    except HTTPException:
        raise
    finally:
        cursor.close()
        conn.close()


def list_referred_clinics(user: dict, pagination: PaginationQuery, scope: str = "own") -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        affiliate = get_affiliate_by_user_id(cursor, user["sub"])
        if not affiliate:
            raise HTTPException(status_code=404, detail="Affiliate profile not found")

        if scope == "all" and affiliate["affiliate_type"] != "main":
            raise HTTPException(status_code=403, detail="Only main affiliate can view all referrals")

        effective_scope = "all" if scope == "all" and affiliate["affiliate_type"] == "main" else "own"
        offset = (pagination.page - 1) * pagination.limit
        total = count_clinic_referrals(cursor, affiliate, scope=effective_scope)
        rows = db_list_clinic_referrals(cursor, affiliate, pagination.limit, offset, scope=effective_scope)

        items = [
            {
                "id": str(r["id"]),
                "referral_code": r["referral_code"],
                "status": r["status"],
                "clinic": {
                    "id": str(r["clinic_id"]),
                    "clinic_name": r["clinic_name"],
                    "email": r["clinic_email"],
                    "status": r["clinic_status"],
                },
                "referred_by": {
                    "affiliate_code": r["referred_by_code"],
                    "email": r["referred_by_email"],
                },
                "created_at": str(r["created_at"]),
            }
            for r in rows
        ]
        return paginated_response(items, total, pagination.page, pagination.limit, key="referrals")
    except HTTPException:
        raise
    finally:
        cursor.close()
        conn.close()


def get_affiliate_profile(user: dict) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        affiliate = get_affiliate_by_user_id(cursor, user["sub"])
        if not affiliate:
            raise HTTPException(status_code=404, detail="Affiliate profile not found")

        own_referrals = count_clinic_referrals(cursor, affiliate, scope="own")
        sub_count = 0
        all_referrals = own_referrals
        if affiliate["affiliate_type"] == "main":
            sub_count = count_sub_affiliates(cursor, str(affiliate["id"]))
            all_referrals = count_clinic_referrals(cursor, affiliate, scope="all")

        parent = None
        if affiliate.get("parent_affiliate_id"):
            cursor.execute(
                """
                SELECT a.affiliate_code, u.email
                FROM affiliates a JOIN users u ON u.id = a.user_id
                WHERE a.id = %s
                """,
                (str(affiliate["parent_affiliate_id"]),),
            )
            row = cursor.fetchone()
            if row:
                parent = {"affiliate_code": row[0], "email": row[1]}

        return {
            "status": True,
            "affiliate": {
                "id": str(affiliate["id"]),
                "email": affiliate["email"],
                "affiliate_code": affiliate["affiliate_code"],
                "affiliate_type": affiliate["affiliate_type"],
                "status": affiliate["status"],
                "profit_margin_percent": float(affiliate.get("profit_margin_percent") or 0),
                "referral_link": _build_referral_link(affiliate["affiliate_code"]),
                "parent_affiliate": parent,
                "max_sub_affiliates": affiliate.get("max_sub_affiliates"),
                "stats": {
                    "own_clinic_referrals": own_referrals,
                    "total_clinic_referrals": all_referrals,
                    "sub_affiliate_count": sub_count,
                },
            },
        }
    except HTTPException:
        raise
    finally:
        cursor.close()
        conn.close()
