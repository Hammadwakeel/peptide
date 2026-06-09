from __future__ import annotations

from typing import Any

from auth_utils import hash_token


def _row_to_dict(cursor, row: tuple) -> dict[str, Any]:
    columns = [desc[0] for desc in cursor.description]
    return dict(zip(columns, row))


def _rows_to_dicts(cursor, rows: list[tuple]) -> list[dict[str, Any]]:
    return [_row_to_dict(cursor, row) for row in rows]


def get_main_affiliate(cursor) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT a.id, a.user_id, a.affiliate_code, a.affiliate_type::text AS affiliate_type,
               a.status::text AS status, u.email
        FROM affiliates a
        JOIN users u ON u.id = a.user_id
        WHERE a.affiliate_type = 'main'
        LIMIT 1
        """
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def get_affiliate_by_user_id(cursor, user_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT a.id, a.user_id, a.affiliate_code, a.affiliate_type::text AS affiliate_type,
               a.parent_affiliate_id, a.status::text AS status,
               a.profit_margin_percent, a.max_sub_affiliates, u.email
        FROM affiliates a
        JOIN users u ON u.id = a.user_id
        WHERE a.user_id = %s
        LIMIT 1
        """,
        (user_id,),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def get_affiliate_by_id(cursor, affiliate_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT a.id, a.user_id, a.affiliate_code, a.affiliate_type::text AS affiliate_type,
               a.parent_affiliate_id, a.status::text AS status,
               a.profit_margin_percent, a.max_sub_affiliates, u.email
        FROM affiliates a
        JOIN users u ON u.id = a.user_id
        WHERE a.id = %s
        LIMIT 1
        """,
        (affiliate_id,),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def find_affiliate_by_code_full(cursor, code: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT a.id, a.user_id, a.affiliate_code, a.affiliate_type::text AS affiliate_type,
               a.parent_affiliate_id, a.status::text AS status, u.email
        FROM affiliates a
        JOIN users u ON u.id = a.user_id
        WHERE a.affiliate_code = %s AND a.status = 'active'
        LIMIT 1
        """,
        (code,),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def create_main_affiliate(cursor, user_id: str, affiliate_code: str) -> dict[str, Any]:
    cursor.execute(
        """
        INSERT INTO affiliates (user_id, affiliate_code, affiliate_type, status)
        VALUES (%s, %s, 'main', 'active')
        RETURNING id, user_id, affiliate_code, affiliate_type::text AS affiliate_type, status::text AS status
        """,
        (user_id, affiliate_code),
    )
    return _row_to_dict(cursor, cursor.fetchone())


def create_sub_affiliate(
    cursor,
    user_id: str,
    affiliate_code: str,
    parent_affiliate_id: str,
    *,
    profit_margin_percent: float = 0,
) -> dict[str, Any]:
    cursor.execute(
        """
        INSERT INTO affiliates (
            user_id, affiliate_code, affiliate_type, parent_affiliate_id,
            status, profit_margin_percent
        )
        VALUES (%s, %s, 'sub', %s, 'inactive', %s)
        RETURNING id, user_id, affiliate_code, affiliate_type::text AS affiliate_type,
                  parent_affiliate_id, status::text AS status, profit_margin_percent
        """,
        (user_id, affiliate_code, parent_affiliate_id, profit_margin_percent),
    )
    return _row_to_dict(cursor, cursor.fetchone())


def count_sub_affiliates(cursor, main_affiliate_id: str) -> int:
    cursor.execute(
        "SELECT COUNT(*) FROM affiliates WHERE parent_affiliate_id = %s AND affiliate_type = 'sub'",
        (main_affiliate_id,),
    )
    return cursor.fetchone()[0]


def list_sub_affiliates(cursor, main_affiliate_id: str, limit: int, offset: int) -> list[dict[str, Any]]:
    cursor.execute(
        """
        SELECT a.id, a.affiliate_code, a.status::text AS status, a.profit_margin_percent,
               a.created_at, u.email,
               COUNT(ar.id) AS clinic_referral_count
        FROM affiliates a
        JOIN users u ON u.id = a.user_id
        LEFT JOIN affiliate_referrals ar ON ar.referring_affiliate_id = a.id
        WHERE a.parent_affiliate_id = %s AND a.affiliate_type = 'sub'
        GROUP BY a.id, u.email
        ORDER BY a.created_at DESC
        LIMIT %s OFFSET %s
        """,
        (main_affiliate_id, limit, offset),
    )
    return _rows_to_dicts(cursor, cursor.fetchall())


def resolve_affiliate_chain(cursor, affiliate: dict) -> tuple[str, str]:
    """Return (referring_affiliate_id, main_affiliate_id)."""
    if affiliate["affiliate_type"] == "main":
        return str(affiliate["id"]), str(affiliate["id"])
    parent_id = affiliate.get("parent_affiliate_id")
    if not parent_id:
        raise ValueError("Sub-affiliate missing parent")
    return str(affiliate["id"]), str(parent_id)


def create_clinic_referral(
    cursor,
    clinic_id: str,
    referring_affiliate_id: str,
    main_affiliate_id: str,
    referral_code: str,
    status: str = "pending",
) -> dict[str, Any]:
    cursor.execute(
        """
        INSERT INTO affiliate_referrals
          (affiliate_id, clinic_id, referral_code, referring_affiliate_id, main_affiliate_id, status)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (affiliate_id, clinic_id) DO UPDATE
          SET referral_code = EXCLUDED.referral_code,
              referring_affiliate_id = EXCLUDED.referring_affiliate_id,
              main_affiliate_id = EXCLUDED.main_affiliate_id
        RETURNING id, affiliate_id, clinic_id, referral_code, referring_affiliate_id, main_affiliate_id, status
        """,
        (referring_affiliate_id, clinic_id, referral_code, referring_affiliate_id, main_affiliate_id, status),
    )
    return _row_to_dict(cursor, cursor.fetchone())


def activate_clinic_referral(cursor, clinic_id: str) -> None:
    cursor.execute(
        "UPDATE affiliate_referrals SET status = 'active' WHERE clinic_id = %s",
        (clinic_id,),
    )


def count_clinic_referrals(
    cursor,
    affiliate: dict,
    *,
    scope: str = "own",
) -> int:
    if affiliate["affiliate_type"] == "main" and scope == "all":
        cursor.execute(
            "SELECT COUNT(*) FROM affiliate_referrals WHERE main_affiliate_id = %s",
            (str(affiliate["id"]),),
        )
    else:
        cursor.execute(
            "SELECT COUNT(*) FROM affiliate_referrals WHERE referring_affiliate_id = %s",
            (str(affiliate["id"]),),
        )
    return cursor.fetchone()[0]


def count_all_affiliates(cursor) -> int:
    cursor.execute("SELECT COUNT(*) FROM affiliates")
    return cursor.fetchone()[0]


def list_all_affiliates(cursor, limit: int, offset: int) -> list[dict[str, Any]]:
    cursor.execute(
        """
        SELECT a.id, a.affiliate_code, a.affiliate_type::text AS affiliate_type,
               a.status::text AS status, a.profit_margin_percent, a.max_sub_affiliates,
               a.created_at, u.email,
               pa.affiliate_code AS parent_affiliate_code,
               COUNT(DISTINCT ar.id) AS clinic_referral_count,
               COUNT(DISTINCT sa.id) AS sub_affiliate_count
        FROM affiliates a
        JOIN users u ON u.id = a.user_id
        LEFT JOIN affiliates pa ON pa.id = a.parent_affiliate_id
        LEFT JOIN affiliate_referrals ar ON ar.referring_affiliate_id = a.id
        LEFT JOIN affiliates sa ON sa.parent_affiliate_id = a.id AND sa.affiliate_type = 'sub'
        GROUP BY a.id, u.email, pa.affiliate_code
        ORDER BY a.created_at DESC
        LIMIT %s OFFSET %s
        """,
        (limit, offset),
    )
    return _rows_to_dicts(cursor, cursor.fetchall())


def list_clinic_referrals(
    cursor,
    affiliate: dict,
    limit: int,
    offset: int,
    *,
    scope: str = "own",
) -> list[dict[str, Any]]:
    if affiliate["affiliate_type"] == "main" and scope == "all":
        cursor.execute(
            """
            SELECT ar.id, ar.referral_code, ar.status, ar.created_at,
                   c.id AS clinic_id, c.clinic_name, c.email AS clinic_email, c.status::text AS clinic_status,
                   ref.affiliate_code AS referred_by_code,
                   u.email AS referred_by_email
            FROM affiliate_referrals ar
            JOIN clinics c ON c.id = ar.clinic_id
            JOIN affiliates ref ON ref.id = ar.referring_affiliate_id
            JOIN users u ON u.id = ref.user_id
            WHERE ar.main_affiliate_id = %s
            ORDER BY ar.created_at DESC
            LIMIT %s OFFSET %s
            """,
            (str(affiliate["id"]), limit, offset),
        )
    else:
        cursor.execute(
            """
            SELECT ar.id, ar.referral_code, ar.status, ar.created_at,
                   c.id AS clinic_id, c.clinic_name, c.email AS clinic_email, c.status::text AS clinic_status,
                   ref.affiliate_code AS referred_by_code,
                   u.email AS referred_by_email
            FROM affiliate_referrals ar
            JOIN clinics c ON c.id = ar.clinic_id
            JOIN affiliates ref ON ref.id = ar.referring_affiliate_id
            JOIN users u ON u.id = ref.user_id
            WHERE ar.referring_affiliate_id = %s
            ORDER BY ar.created_at DESC
            LIMIT %s OFFSET %s
            """,
            (str(affiliate["id"]), limit, offset),
        )
    return _rows_to_dicts(cursor, cursor.fetchall())


def update_affiliate_max_sub_affiliates(
    cursor,
    affiliate_id: str,
    max_sub_affiliates: int | None,
) -> dict[str, Any] | None:
    cursor.execute(
        """
        UPDATE affiliates
        SET max_sub_affiliates = %s, updated_at = NOW()
        WHERE id = %s
        RETURNING id, affiliate_code, affiliate_type::text AS affiliate_type,
                  max_sub_affiliates, status::text AS status
        """,
        (max_sub_affiliates, affiliate_id),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def update_affiliate_profit_margin(
    cursor, affiliate_id: str, profit_margin_percent: float,
) -> dict[str, Any] | None:
    cursor.execute(
        """
        UPDATE affiliates
        SET profit_margin_percent = %s, updated_at = NOW()
        WHERE id = %s
        RETURNING id, affiliate_code, affiliate_type::text AS affiliate_type,
                  profit_margin_percent, status::text AS status
        """,
        (profit_margin_percent, affiliate_id),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def update_sub_affiliates_profit_margin(
    cursor,
    main_affiliate_id: str,
    profit_margin_percent: float,
) -> int:
    """Apply the main affiliate's profit margin to all of its sub-affiliates."""
    cursor.execute(
        """
        UPDATE affiliates
        SET profit_margin_percent = %s, updated_at = NOW()
        WHERE parent_affiliate_id = %s AND affiliate_type = 'sub'
        """,
        (profit_margin_percent, main_affiliate_id),
    )
    return cursor.rowcount
