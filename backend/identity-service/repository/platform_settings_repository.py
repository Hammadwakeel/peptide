from __future__ import annotations

from typing import Any


def _row_to_dict(cursor, row: tuple) -> dict[str, Any]:
    columns = [desc[0] for desc in cursor.description]
    return dict(zip(columns, row))


def get_platform_settings(cursor) -> dict[str, Any]:
    cursor.execute(
        """
        SELECT id,
               default_profit_margin_percent,
               platform_commission_percent,
               affiliate_referral_fee_percent,
               payout_frequency,
               minimum_payout_threshold,
               default_shipping_rate,
               tax_calculation,
               updated_at
        FROM platform_settings
        WHERE id = 1
        LIMIT 1
        """
    )
    row = cursor.fetchone()
    if not row:
        cursor.execute(
            """
            INSERT INTO platform_settings (id)
            VALUES (1)
            RETURNING id,
                      default_profit_margin_percent,
                      platform_commission_percent,
                      affiliate_referral_fee_percent,
                      payout_frequency,
                      minimum_payout_threshold,
                      default_shipping_rate,
                      tax_calculation,
                      updated_at
            """
        )
        row = cursor.fetchone()
    return _row_to_dict(cursor, row)


def update_platform_settings(cursor, updates: dict[str, Any]) -> dict[str, Any]:
    allowed = {
        "default_profit_margin_percent",
        "platform_commission_percent",
        "affiliate_referral_fee_percent",
        "payout_frequency",
        "minimum_payout_threshold",
        "default_shipping_rate",
        "tax_calculation",
    }
    fields = {key: value for key, value in updates.items() if key in allowed}
    if not fields:
        return get_platform_settings(cursor)

    set_clause = ", ".join(f"{field} = %s" for field in fields)
    values = list(fields.values())
    cursor.execute(
        f"""
        UPDATE platform_settings
        SET {set_clause}, updated_at = NOW()
        WHERE id = 1
        RETURNING id,
                  default_profit_margin_percent,
                  platform_commission_percent,
                  affiliate_referral_fee_percent,
                  payout_frequency,
                  minimum_payout_threshold,
                  default_shipping_rate,
                  tax_calculation,
                  updated_at
        """,
        values,
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row)
