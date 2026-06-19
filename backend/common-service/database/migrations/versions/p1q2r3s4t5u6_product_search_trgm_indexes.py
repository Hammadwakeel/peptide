"""add pg_trgm indexes for product search

Revision ID: p1q2r3s4t5u6
Revises: o0p1q2r3s4t5
Create Date: 2026-06-19

"""
from typing import Sequence, Union

from alembic import op

revision: str = "p1q2r3s4t5u6"
down_revision: Union[str, None] = "o0p1q2r3s4t5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_products_name_trgm "
        "ON products USING gin (product_name gin_trgm_ops)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_products_sku_trgm "
        "ON products USING gin (sku gin_trgm_ops)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_products_description_trgm "
        "ON products USING gin (description gin_trgm_ops)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_products_description_trgm")
    op.execute("DROP INDEX IF EXISTS ix_products_sku_trgm")
    op.execute("DROP INDEX IF EXISTS ix_products_name_trgm")
