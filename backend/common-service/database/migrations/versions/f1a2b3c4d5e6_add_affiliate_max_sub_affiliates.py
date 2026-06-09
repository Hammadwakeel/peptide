"""add max_sub_affiliates to affiliates

Revision ID: f1a2b3c4d5e6
Revises: e4f5a6b7c8d9
Create Date: 2026-06-09

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "f1a2b3c4d5e6"
down_revision: Union[str, None] = "e4f5a6b7c8d9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "affiliates",
        sa.Column("max_sub_affiliates", sa.Integer(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("affiliates", "max_sub_affiliates")
