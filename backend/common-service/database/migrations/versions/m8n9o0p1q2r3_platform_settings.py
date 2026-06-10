"""platform settings singleton

Revision ID: m8n9o0p1q2r3
Revises: l7g8h9i0j1k2
Create Date: 2026-06-10

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "m8n9o0p1q2r3"
down_revision: Union[str, None] = "l7g8h9i0j1k2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "platform_settings",
        sa.Column("id", sa.SmallInteger(), primary_key=True, server_default=sa.text("1")),
        sa.Column(
            "default_profit_margin_percent",
            sa.Numeric(precision=5, scale=2),
            nullable=False,
            server_default=sa.text("0"),
        ),
        sa.Column(
            "platform_commission_percent",
            sa.Numeric(precision=5, scale=2),
            nullable=False,
            server_default=sa.text("10"),
        ),
        sa.Column(
            "affiliate_referral_fee_percent",
            sa.Numeric(precision=5, scale=2),
            nullable=False,
            server_default=sa.text("5"),
        ),
        sa.Column(
            "payout_frequency",
            sa.String(length=20),
            nullable=False,
            server_default=sa.text("'biweekly'"),
        ),
        sa.Column(
            "minimum_payout_threshold",
            sa.Numeric(precision=10, scale=2),
            nullable=False,
            server_default=sa.text("500"),
        ),
        sa.Column(
            "default_shipping_rate",
            sa.Numeric(precision=10, scale=2),
            nullable=False,
            server_default=sa.text("12"),
        ),
        sa.Column(
            "tax_calculation",
            sa.String(length=20),
            nullable=False,
            server_default=sa.text("'auto'"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.CheckConstraint("id = 1", name="ck_platform_settings_singleton"),
        sa.CheckConstraint(
            "default_profit_margin_percent >= 0 AND default_profit_margin_percent <= 100",
            name="ck_platform_settings_default_profit_margin_range",
        ),
        sa.CheckConstraint(
            "platform_commission_percent >= 0 AND platform_commission_percent <= 100",
            name="ck_platform_settings_platform_commission_range",
        ),
        sa.CheckConstraint(
            "affiliate_referral_fee_percent >= 0 AND affiliate_referral_fee_percent <= 100",
            name="ck_platform_settings_affiliate_referral_fee_range",
        ),
        sa.CheckConstraint(
            "payout_frequency IN ('weekly', 'biweekly', 'monthly')",
            name="ck_platform_settings_payout_frequency",
        ),
        sa.CheckConstraint(
            "tax_calculation IN ('auto', 'manual')",
            name="ck_platform_settings_tax_calculation",
        ),
    )
    op.execute("INSERT INTO platform_settings (id) VALUES (1)")


def downgrade() -> None:
    op.drop_table("platform_settings")
