"""clinic application workflow + affiliate tiers + clinic_banking_details

Revision ID: c2d3e4f5a6b7
Revises: b1a2c3d4e5f6
Create Date: 2026-06-09

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "c2d3e4f5a6b7"
down_revision: Union[str, None] = "b1a2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

affiliate_type_enum = postgresql.ENUM("main", "sub", name="affiliate_type")


def upgrade() -> None:
    # --- clinics: onboarding / application workflow fields ---
    op.add_column("clinics", sa.Column("primary_contact_name", sa.String(length=255), nullable=True))
    op.add_column("clinics", sa.Column("state_license_number", sa.String(length=100), nullable=True))
    op.add_column("clinics", sa.Column("application_status", sa.String(length=50), nullable=True))
    op.add_column("clinics", sa.Column("application_password_hash", sa.Text(), nullable=True))
    op.add_column("clinics", sa.Column("rejection_reason", sa.Text(), nullable=True))
    op.add_column("clinics", sa.Column("admin_note", sa.Text(), nullable=True))
    op.create_index("ix_clinics_application_status", "clinics", ["application_status"], unique=False)

    # --- affiliates: two-tier hierarchy ---
    affiliate_type_enum.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "affiliates",
        sa.Column(
            "affiliate_type",
            affiliate_type_enum,
            nullable=False,
            server_default="main",
        ),
    )
    op.add_column("affiliates", sa.Column("parent_affiliate_id", sa.UUID(), nullable=True))
    op.create_index(
        "ix_affiliates_parent_affiliate_id", "affiliates", ["parent_affiliate_id"], unique=False
    )
    op.create_foreign_key(
        "fk_affiliates_parent_affiliate_id_affiliates",
        "affiliates",
        "affiliates",
        ["parent_affiliate_id"],
        ["id"],
        ondelete="SET NULL",
    )

    # --- affiliate_referrals: multi-tier attribution ---
    op.add_column("affiliate_referrals", sa.Column("referring_affiliate_id", sa.UUID(), nullable=True))
    op.add_column("affiliate_referrals", sa.Column("main_affiliate_id", sa.UUID(), nullable=True))
    op.create_index(
        "ix_affiliate_referrals_referring_affiliate_id",
        "affiliate_referrals",
        ["referring_affiliate_id"],
        unique=False,
    )
    op.create_index(
        "ix_affiliate_referrals_main_affiliate_id",
        "affiliate_referrals",
        ["main_affiliate_id"],
        unique=False,
    )
    op.create_foreign_key(
        "fk_affiliate_referrals_referring_affiliate_id_affiliates",
        "affiliate_referrals",
        "affiliates",
        ["referring_affiliate_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_affiliate_referrals_main_affiliate_id_affiliates",
        "affiliate_referrals",
        "affiliates",
        ["main_affiliate_id"],
        ["id"],
        ondelete="SET NULL",
    )

    # --- clinic_banking_details: encrypted onboarding banking info ---
    op.create_table(
        "clinic_banking_details",
        sa.Column("clinic_id", sa.UUID(), nullable=False),
        sa.Column("bank_name", sa.String(length=255), nullable=False),
        sa.Column("account_type", sa.String(length=50), nullable=False),
        sa.Column("encrypted_routing", sa.Text(), nullable=False),
        sa.Column("encrypted_account", sa.Text(), nullable=False),
        sa.Column("routing_last4", sa.String(length=10), nullable=False),
        sa.Column("account_last4", sa.String(length=10), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(
            ["clinic_id"], ["clinics.id"], name="fk_clinic_banking_details_clinic_id_clinics", ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_clinic_banking_details"),
        sa.UniqueConstraint("clinic_id", name="uq_clinic_banking_details_clinic_id"),
    )
    op.execute(
        "CREATE TRIGGER trg_clinic_banking_details_updated "
        "BEFORE UPDATE ON clinic_banking_details "
        "FOR EACH ROW EXECUTE PROCEDURE set_updated_at();"
    )


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trg_clinic_banking_details_updated ON clinic_banking_details;")
    op.drop_table("clinic_banking_details")

    op.drop_constraint(
        "fk_affiliate_referrals_main_affiliate_id_affiliates", "affiliate_referrals", type_="foreignkey"
    )
    op.drop_constraint(
        "fk_affiliate_referrals_referring_affiliate_id_affiliates", "affiliate_referrals", type_="foreignkey"
    )
    op.drop_index("ix_affiliate_referrals_main_affiliate_id", table_name="affiliate_referrals")
    op.drop_index("ix_affiliate_referrals_referring_affiliate_id", table_name="affiliate_referrals")
    op.drop_column("affiliate_referrals", "main_affiliate_id")
    op.drop_column("affiliate_referrals", "referring_affiliate_id")

    op.drop_constraint("fk_affiliates_parent_affiliate_id_affiliates", "affiliates", type_="foreignkey")
    op.drop_index("ix_affiliates_parent_affiliate_id", table_name="affiliates")
    op.drop_column("affiliates", "parent_affiliate_id")
    op.drop_column("affiliates", "affiliate_type")
    affiliate_type_enum.drop(op.get_bind(), checkfirst=True)

    op.drop_index("ix_clinics_application_status", table_name="clinics")
    op.drop_column("clinics", "admin_note")
    op.drop_column("clinics", "rejection_reason")
    op.drop_column("clinics", "application_password_hash")
    op.drop_column("clinics", "application_status")
    op.drop_column("clinics", "state_license_number")
    op.drop_column("clinics", "primary_contact_name")
