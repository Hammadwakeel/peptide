"""product types peptides/pharmacy, category scope, shipping company

Revision ID: i4d5e6f7g8h9
Revises: f5a6b7c8d9e0
Create Date: 2026-06-10

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "i4d5e6f7g8h9"
down_revision: Union[str, None] = "f5a6b7c8d9e0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE product_type RENAME VALUE 'ruo' TO 'peptides'")

    op.add_column(
        "categories",
        sa.Column(
            "product_type",
            sa.Enum("peptides", "pharmacy", name="product_type", create_type=False),
            nullable=True,
        ),
    )
    op.execute("UPDATE categories SET product_type = 'peptides' WHERE product_type IS NULL")
    op.alter_column("categories", "product_type", nullable=False)

    op.drop_constraint("uq_categories_name", "categories", type_="unique")
    op.drop_constraint("uq_categories_slug", "categories", type_="unique")
    op.create_unique_constraint(
        "uq_categories_name_product_type", "categories", ["name", "product_type"]
    )
    op.create_unique_constraint(
        "uq_categories_slug_product_type", "categories", ["slug", "product_type"]
    )
    op.create_index("ix_categories_product_type", "categories", ["product_type"])

    op.add_column("products", sa.Column("shipping_company", sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column("products", "shipping_company")

    op.drop_index("ix_categories_product_type", table_name="categories")
    op.drop_constraint("uq_categories_slug_product_type", "categories", type_="unique")
    op.drop_constraint("uq_categories_name_product_type", "categories", type_="unique")
    op.create_unique_constraint("uq_categories_slug", "categories", ["slug"])
    op.create_unique_constraint("uq_categories_name", "categories", ["name"])
    op.drop_column("categories", "product_type")

    op.execute("ALTER TYPE product_type RENAME VALUE 'peptides' TO 'ruo'")
