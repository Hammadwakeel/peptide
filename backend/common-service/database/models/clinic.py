import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..base import Base, CreatedAtMixin, TimestampMixin, UUIDMixin
from ..enums import AccountStatus, pg_enum


class Affiliate(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "affiliates"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    affiliate_code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    status: Mapped[AccountStatus] = mapped_column(
        pg_enum(AccountStatus, "account_status"),
        nullable=False,
        server_default=AccountStatus.active.value,
    )


class Clinic(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "clinics"

    clinic_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50))
    npi_number: Mapped[str | None] = mapped_column(String(50))
    dea_number: Mapped[str | None] = mapped_column(String(50))
    status: Mapped[AccountStatus] = mapped_column(
        pg_enum(AccountStatus, "account_status"),
        nullable=False,
        server_default=AccountStatus.pending.value,
    )
    affiliate_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("affiliates.id", ondelete="SET NULL")
    )


class ClinicAddress(UUIDMixin, CreatedAtMixin, Base):
    __tablename__ = "clinic_addresses"

    clinic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id", ondelete="CASCADE"), nullable=False
    )
    address1: Mapped[str] = mapped_column(Text, nullable=False)
    address2: Mapped[str | None] = mapped_column(Text)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    zip: Mapped[str] = mapped_column(String(20), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False, server_default="US")
    is_primary: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("TRUE"))


class ClinicUser(UUIDMixin, CreatedAtMixin, Base):
    __tablename__ = "clinic_users"
    __table_args__ = (UniqueConstraint("clinic_id", "user_id"),)

    clinic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    access_level: Mapped[str] = mapped_column(String(50), nullable=False, server_default="staff")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("TRUE"))


class ClinicBranding(UUIDMixin, Base):
    __tablename__ = "clinic_branding"

    clinic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    logo_url: Mapped[str | None] = mapped_column(Text)
    theme_color: Mapped[str | None] = mapped_column(String(50), server_default="#1a365d")
    tagline: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("NOW()"), onupdate=text("NOW()")
    )


class ClinicBankAccount(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "clinic_bank_accounts"

    clinic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id", ondelete="CASCADE"), nullable=False
    )
    bank_name: Mapped[str] = mapped_column(String(255), nullable=False)
    account_last4: Mapped[str] = mapped_column(String(10), nullable=False)
    routing_last4: Mapped[str | None] = mapped_column(String(10))
    stripe_account_id: Mapped[str | None] = mapped_column(Text)
    payout_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("FALSE"))


class ClinicSettings(UUIDMixin, Base):
    __tablename__ = "clinic_settings"

    clinic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    notification_email: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("TRUE"))
    notification_sms: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("FALSE"))
    auto_approve_requests: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("FALSE"))
    payout_schedule_days: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("3"))
    timezone: Mapped[str | None] = mapped_column(String(50), server_default="America/New_York")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("NOW()"), onupdate=text("NOW()")
    )


class ClinicInvitation(UUIDMixin, CreatedAtMixin, Base):
    __tablename__ = "clinic_invitations"

    clinic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id", ondelete="CASCADE"), nullable=False
    )
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, server_default="staff")
    token_hash: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, server_default="pending")
    invited_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
