"""add slug column to products

Revision ID: k6f7g8h9i0j1
Revises: j5e6f7g8h9i0
Create Date: 2026-06-10

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "k6f7g8h9i0j1"
down_revision: Union[str, None] = "j5e6f7g8h9i0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("products", sa.Column("slug", sa.String(length=255), nullable=True))
    op.execute(
        """
        UPDATE products
        SET slug = LOWER(REGEXP_REPLACE(TRIM(product_name), '[^a-zA-Z0-9]+', '-', 'g'))
        WHERE slug IS NULL
        """
    )
    op.execute(
        """
        UPDATE products p
        SET slug = p.slug || '-' || LEFT(REPLACE(p.id::text, '-', ''), 8)
        WHERE p.id IN (
            SELECT id FROM (
                SELECT id, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) AS rn
                FROM products
                WHERE slug IS NOT NULL
            ) d WHERE rn > 1
        )
        """
    )
    op.create_index("uq_products_slug", "products", ["slug"], unique=True)


def downgrade() -> None:
    op.drop_index("uq_products_slug", table_name="products")
    op.drop_column("products", "slug")
