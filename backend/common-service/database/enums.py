import enum

from sqlalchemy import Enum as SAEnum


def pg_enum(py_enum: type[enum.Enum], name: str) -> SAEnum:
    """Build a PostgreSQL ENUM column type that stores the enum *values*."""
    return SAEnum(
        py_enum,
        name=name,
        values_callable=lambda e: [member.value for member in e],
    )


class UserRole(str, enum.Enum):
    super_admin = "super_admin"
    admin = "admin"
    clinic_owner = "clinic_owner"
    clinic_staff = "clinic_staff"
    patient = "patient"
    affiliate = "affiliate"


class AccountStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    suspended = "suspended"
    pending = "pending"


class OrderType(str, enum.Enum):
    customer = "customer"
    clinic = "clinic"
    pending_payment = "pending_payment"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    refunded = "refunded"
    partial = "partial"


class ShipmentStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    shipped = "shipped"
    in_transit = "in_transit"
    delivered = "delivered"
    cancelled = "cancelled"


class RequestStatus(str, enum.Enum):
    pending_review = "pending_review"
    approved = "approved"
    rejected = "rejected"
    cancelled = "cancelled"


class PayoutStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    paid = "paid"
    failed = "failed"
    cancelled = "cancelled"


class DocumentStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    expired = "expired"


class ProductType(str, enum.Enum):
    ruo = "ruo"
    pharmacy = "pharmacy"


class StockStatus(str, enum.Enum):
    in_stock = "in_stock"
    low = "low"
    out_of_stock = "out_of_stock"
    discontinued = "discontinued"
