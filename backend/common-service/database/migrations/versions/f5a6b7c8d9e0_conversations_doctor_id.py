"""conversations doctor_id and last_message_at

Revision ID: f5a6b7c8d9e0
Revises: g2b3c4d5e6f7
Create Date: 2026-06-09

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "f5a6b7c8d9e0"
down_revision: Union[str, None] = "g2b3c4d5e6f7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("conversations", sa.Column("doctor_id", sa.UUID(), nullable=True))
    op.add_column(
        "conversations",
        sa.Column("last_message_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_foreign_key(
        op.f("fk_conversations_doctor_id_users"),
        "conversations",
        "users",
        ["doctor_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_index(op.f("ix_conversations_doctor_id"), "conversations", ["doctor_id"], unique=False)

    op.drop_constraint(op.f("uq_conversations_clinic_id"), "conversations", type_="unique")
    op.create_unique_constraint(
        op.f("uq_conversations_doctor_id"),
        "conversations",
        ["doctor_id", "patient_id"],
    )

    op.alter_column("conversations", "doctor_id", nullable=False)


def downgrade() -> None:
    op.drop_constraint(op.f("uq_conversations_doctor_id"), "conversations", type_="unique")
    op.create_unique_constraint(
        op.f("uq_conversations_clinic_id"),
        "conversations",
        ["clinic_id", "patient_id"],
    )
    op.drop_index(op.f("ix_conversations_doctor_id"), table_name="conversations")
    op.drop_constraint(op.f("fk_conversations_doctor_id_users"), "conversations", type_="foreignkey")
    op.drop_column("conversations", "last_message_at")
    op.drop_column("conversations", "doctor_id")
