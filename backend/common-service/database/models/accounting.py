import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..base import Base, CreatedAtMixin, UUIDMixin
from ..enums import PayoutStatus, pg_enum


class Payout(UUIDMixin, CreatedAtMixin, Base):
    __tablename__ = "payouts"
    __table_args__ = (CheckConstraint("amount >= 0", name="amount_non_negative"),)

    clinic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    payout_status: Mapped[PayoutStatus] = mapped_column(
        pg_enum(PayoutStatus, "payout_status"),
        nullable=False,
        server_default=PayoutStatus.pending.value,
    )
    payout_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    stripe_transfer_id: Mapped[str | None] = mapped_column(Text)


class Transaction(UUIDMixin, CreatedAtMixin, Base):
    __tablename__ = "transactions"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    clinic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    gross_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    fees: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))
    profit: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))


class PayoutBatch(UUIDMixin, CreatedAtMixin, Base):
    __tablename__ = "payout_batches"

    batch_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))
    status: Mapped[PayoutStatus] = mapped_column(
        pg_enum(PayoutStatus, "payout_status"),
        nullable=False,
        server_default=PayoutStatus.pending.value,
    )
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class PayoutLineItem(UUIDMixin, CreatedAtMixin, Base):
    __tablename__ = "payout_line_items"

    batch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("payout_batches.id", ondelete="CASCADE"), nullable=False, index=True
    )
    payout_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("payouts.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
