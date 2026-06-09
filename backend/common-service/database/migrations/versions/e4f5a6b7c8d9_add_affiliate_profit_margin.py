"""add profit_margin_percent to affiliates

Revision ID: e4f5a6b7c8d9
Revises: d3e4f5a6b7c8
Create Date: 2026-06-09

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "e4f5a6b7c8d9"
down_revision: Union[str, None] = "d3e4f5a6b7c8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "affiliates",
        sa.Column(
            "profit_margin_percent",
            sa.Numeric(precision=5, scale=2),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )
    op.create_check_constraint(
        "ck_affiliates_profit_margin_percent_range",
        "affiliates",
        "profit_margin_percent >= 0 AND profit_margin_percent <= 100",
    )


def downgrade() -> None:
    op.drop_constraint("ck_affiliates_profit_margin_percent_range", "affiliates", type_="check")
    op.drop_column("affiliates", "profit_margin_percent")
