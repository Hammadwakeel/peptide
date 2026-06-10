"""remove shipping_company from products

Revision ID: j5e6f7g8h9i0
Revises: i4d5e6f7g8h9
Create Date: 2026-06-10

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "j5e6f7g8h9i0"
down_revision: Union[str, None] = "i4d5e6f7g8h9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("products", "shipping_company")


def downgrade() -> None:
    op.add_column("products", sa.Column("shipping_company", sa.String(length=100), nullable=True))
