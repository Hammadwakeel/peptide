"""patient order physician review and shipping carrier

Revision ID: l7g8h9i0j1k2
Revises: k6f7g8h9i0j1
Create Date: 2026-06-10

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "l7g8h9i0j1k2"
down_revision: Union[str, None] = "k6f7g8h9i0j1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

request_status = sa.Enum(
    "pending_review",
    "approved",
    "rejected",
    "cancelled",
    name="request_status",
    create_type=False,
)


def upgrade() -> None:
    op.add_column(
        "orders",
        sa.Column(
            "review_status",
            request_status,
            server_default="pending_review",
            nullable=False,
        ),
    )
    op.add_column("orders", sa.Column("reviewed_by", sa.UUID(), nullable=True))
    op.add_column("orders", sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("orders", sa.Column("rejection_reason", sa.Text(), nullable=True))
    op.add_column("orders", sa.Column("patient_address_id", sa.UUID(), nullable=True))
    op.add_column("orders", sa.Column("shipping_carrier", sa.String(length=50), nullable=True))
    op.create_foreign_key(
        op.f("fk_orders_reviewed_by_users"),
        "orders",
        "users",
        ["reviewed_by"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        op.f("fk_orders_patient_address_id_patient_addresses"),
        "orders",
        "patient_addresses",
        ["patient_address_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index("ix_orders_review_status", "orders", ["review_status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_orders_review_status", table_name="orders")
    op.drop_constraint(
        op.f("fk_orders_patient_address_id_patient_addresses"),
        "orders",
        type_="foreignkey",
    )
    op.drop_constraint(op.f("fk_orders_reviewed_by_users"), "orders", type_="foreignkey")
    op.drop_column("orders", "shipping_carrier")
    op.drop_column("orders", "patient_address_id")
    op.drop_column("orders", "rejection_reason")
    op.drop_column("orders", "reviewed_at")
    op.drop_column("orders", "reviewed_by")
    op.drop_column("orders", "review_status")
