"""add clinic onboarding personal and business fields

Revision ID: d3e4f5a6b7c8
Revises: c2d3e4f5a6b7
Create Date: 2026-06-09

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "d3e4f5a6b7c8"
down_revision: Union[str, None] = "c2d3e4f5a6b7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("clinics", sa.Column("first_name", sa.String(length=100), nullable=True))
    op.add_column("clinics", sa.Column("last_name", sa.String(length=100), nullable=True))
    op.add_column("clinics", sa.Column("website", sa.String(length=255), nullable=True))
    op.add_column("clinics", sa.Column("tax_id", sa.String(length=50), nullable=True))
    op.add_column("clinics", sa.Column("reseller_permit_number", sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column("clinics", "reseller_permit_number")
    op.drop_column("clinics", "tax_id")
    op.drop_column("clinics", "website")
    op.drop_column("clinics", "last_name")
    op.drop_column("clinics", "first_name")
