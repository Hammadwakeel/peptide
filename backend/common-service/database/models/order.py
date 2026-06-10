import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..base import Base, CreatedAtMixin, TimestampMixin, UUIDMixin
from ..enums import OrderType, PaymentStatus, RequestStatus, ShipmentStatus, pg_enum


class Order(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "orders"
    __table_args__ = (
        CheckConstraint("total_amount >= 0", name="total_amount_non_negative"),
        Index("ix_orders_clinic_created", "clinic_id", text("created_at DESC")),
        Index("ix_orders_patient", "patient_id"),
        Index("ix_orders_status", "payment_status", "shipment_status"),
    )

    order_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    clinic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id", ondelete="RESTRICT"), nullable=False
    )
    patient_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patients.id", ondelete="SET NULL")
    )
    order_type: Mapped[OrderType] = mapped_column(
        pg_enum(OrderType, "order_type"), nullable=False, server_default=OrderType.customer.value
    )
    payment_status: Mapped[PaymentStatus] = mapped_column(
        pg_enum(PaymentStatus, "payment_status"),
        nullable=False,
        server_default=PaymentStatus.pending.value,
    )
    shipment_status: Mapped[ShipmentStatus] = mapped_column(
        pg_enum(ShipmentStatus, "shipment_status"),
        nullable=False,
        server_default=ShipmentStatus.pending.value,
    )
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))
    net_cost: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))
    profit: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))
    notes: Mapped[str | None] = mapped_column(Text)
    payment_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    review_status: Mapped[RequestStatus] = mapped_column(
        pg_enum(RequestStatus, "request_status"),
        nullable=False,
        server_default=RequestStatus.pending_review.value,
    )
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    rejection_reason: Mapped[str | None] = mapped_column(Text)
    patient_address_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patient_addresses.id", ondelete="SET NULL")
    )
    shipping_carrier: Mapped[str | None] = mapped_column(String(50))


class OrderItem(UUIDMixin, CreatedAtMixin, Base):
    __tablename__ = "order_items"
    __table_args__ = (CheckConstraint("qty > 0", name="qty_positive"),)

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    variant_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("product_variants.id", ondelete="SET NULL")
    )
    qty: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    unit_cost: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))
    total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)


class OrderTracking(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "order_tracking"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    carrier: Mapped[str | None] = mapped_column(String(100))
    tracking_number: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(100), nullable=False, server_default="pending")
    shipped_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class OrderPayment(UUIDMixin, CreatedAtMixin, Base):
    __tablename__ = "order_payments"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    stripe_payment_intent_id: Mapped[str | None] = mapped_column(Text)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(
        pg_enum(PaymentStatus, "payment_status"),
        nullable=False,
        server_default=PaymentStatus.pending.value,
    )
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class OrderRefund(UUIDMixin, CreatedAtMixin, Base):
    __tablename__ = "order_refunds"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    reason: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), nullable=False, server_default="pending")
    refunded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class OrderShipmentEvent(UUIDMixin, Base):
    __tablename__ = "order_shipment_events"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    tracking_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("order_tracking.id", ondelete="CASCADE"), index=True
    )
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    location: Mapped[str | None] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("NOW()")
    )


class PendingPaymentOrder(UUIDMixin, CreatedAtMixin, Base):
    __tablename__ = "pending_payment_orders"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True
    )
    payment_link: Mapped[str | None] = mapped_column(Text)
    reminder_sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class ClinicBulkOrder(UUIDMixin, CreatedAtMixin, Base):
    __tablename__ = "clinic_bulk_orders"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    clinic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id", ondelete="CASCADE"), nullable=False, index=True
    )
    shipping_address_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinic_addresses.id", ondelete="SET NULL")
    )
