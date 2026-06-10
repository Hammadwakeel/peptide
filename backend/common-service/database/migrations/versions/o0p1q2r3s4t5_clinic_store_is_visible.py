"""Add is_visible to clinic_store_products

Revision ID: o0p1q2r3s4t5
Revises: n9o0p1q2r3s4
Create Date: 2026-06-10

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "o0p1q2r3s4t5"
down_revision: Union[str, None] = "n9o0p1q2r3s4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "clinic_store_products",
        sa.Column("is_visible", sa.Boolean(), nullable=False, server_default=sa.text("TRUE")),
    )
    op.execute(
        "UPDATE clinic_store_products SET is_visible = active WHERE active = TRUE"
    )


def downgrade() -> None:
    op.drop_column("clinic_store_products", "is_visible")
