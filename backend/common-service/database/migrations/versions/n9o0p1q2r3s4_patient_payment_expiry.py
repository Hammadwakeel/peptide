"""patient payment method expiry fields

Revision ID: n9o0p1q2r3s4
Revises: m8n9o0p1q2r3
Create Date: 2026-06-10

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "n9o0p1q2r3s4"
down_revision: Union[str, None] = "m8n9o0p1q2r3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "patient_payment_methods",
        sa.Column("exp_month", sa.SmallInteger(), nullable=True),
    )
    op.add_column(
        "patient_payment_methods",
        sa.Column("exp_year", sa.SmallInteger(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("patient_payment_methods", "exp_year")
    op.drop_column("patient_payment_methods", "exp_month")
