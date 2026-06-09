import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Numeric, String, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..base import Base, CreatedAtMixin, UUIDMixin
from ..enums import PayoutStatus, pg_enum


class AffiliateReferral(UUIDMixin, CreatedAtMixin, Base):
    __tablename__ = "affiliate_referrals"
    __table_args__ = (UniqueConstraint("affiliate_id", "clinic_id"),)

    affiliate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("affiliates.id", ondelete="RESTRICT"), nullable=False
    )
    clinic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    referral_code: Mapped[str] = mapped_column(String(100), nullable=False)
    commission: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))
    status: Mapped[str] = mapped_column(String(50), nullable=False, server_default="active")
    # The affiliate who actually made the referral and the top-of-chain "main"
    # affiliate, used to compute multi-tier referral attribution.
    referring_affiliate_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("affiliates.id", ondelete="SET NULL"), index=True
    )
    main_affiliate_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("affiliates.id", ondelete="SET NULL"), index=True
    )


class AffiliateCommission(UUIDMixin, CreatedAtMixin, Base):
    __tablename__ = "affiliate_commissions"
    __table_args__ = (CheckConstraint("amount >= 0", name="amount_non_negative"),)

    affiliate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("affiliates.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    order_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="SET NULL"), index=True
    )
    clinic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    rate_percent: Mapped[float | None] = mapped_column(Numeric(5, 2))
    status: Mapped[str] = mapped_column(String(50), nullable=False, server_default="pending")


class AffiliatePayout(UUIDMixin, CreatedAtMixin, Base):
    __tablename__ = "affiliate_payouts"
    __table_args__ = (CheckConstraint("amount >= 0", name="amount_non_negative"),)

    affiliate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("affiliates.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    payout_status: Mapped[PayoutStatus] = mapped_column(
        pg_enum(PayoutStatus, "payout_status"),
        nullable=False,
        server_default=PayoutStatus.pending.value,
    )
    payout_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
