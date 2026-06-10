"""add invited_by to patient_invites

Revision ID: h3c4d5e6f7g8
Revises: g2b3c4d5e6f7
Create Date: 2026-06-10

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "h3c4d5e6f7g8"
down_revision: Union[str, None] = "g2b3c4d5e6f7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "patient_invites",
        sa.Column("invited_by", sa.UUID(), nullable=True),
    )
    op.create_foreign_key(
        op.f("fk_patient_invites_invited_by_users"),
        "patient_invites",
        "users",
        ["invited_by"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(
        op.f("ix_patient_invites_invited_by"),
        "patient_invites",
        ["invited_by"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_patient_invites_invited_by"), table_name="patient_invites")
    op.drop_constraint(
        op.f("fk_patient_invites_invited_by_users"),
        "patient_invites",
        type_="foreignkey",
    )
    op.drop_column("patient_invites", "invited_by")
