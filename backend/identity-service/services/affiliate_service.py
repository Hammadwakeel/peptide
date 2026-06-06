from __future__ import annotations

import secrets

from fastapi import HTTPException

from auth_utils import generate_password, hash_password
from db import connect
from email_service import send_credentials_email
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
from repository.user_repository import create_user
from schemas.affiliate import InviteSubAffiliateRequest
from schemas.pagination import PaginationQuery, paginated_response


def _require_main_affiliate(cursor, user: dict) -> dict:
    affiliate = get_affiliate_by_user_id(cursor, user["sub"])
    if not affiliate:
        raise HTTPException(status_code=404, detail="Affiliate profile not found")
    if affiliate["affiliate_type"] != "main":
        raise HTTPException(status_code=403, detail="Only the main affiliate can perform this action")
    return affiliate


def _generate_sub_code() -> str:
    return f"sub-{secrets.token_hex(4)}"


def invite_sub_affiliate(user: dict, body: InviteSubAffiliateRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        main_affiliate = _require_main_affiliate(cursor, user)

        if find_user_by_email(cursor, body.email):
            raise HTTPException(status_code=409, detail="Email already registered")

        code = body.affiliate_code or _generate_sub_code()
        if find_affiliate_by_code(cursor, code):
            raise HTTPException(status_code=409, detail="Affiliate code already taken")

        password = generate_password()
        new_user = create_user(
            cursor,
            body.email,
            hash_password(password),
            "affiliate",
            email_verified=True,
        )
        sub = create_sub_affiliate(
            cursor,
            str(new_user["id"]),
            code,
            str(main_affiliate["id"]),
        )

        send_credentials_email(body.email, password, "Sub-Affiliate")
        conn.commit()

        return {
            "status": True,
            "message": "Sub-affiliate invited. Credentials sent to email.",
            "sub_affiliate": {
                "id": str(sub["id"]),
                "email": new_user["email"],
                "affiliate_code": sub["affiliate_code"],
                "parent_affiliate_id": str(main_affiliate["id"]),
                "affiliate_type": "sub",
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
                "parent_affiliate": parent,
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
