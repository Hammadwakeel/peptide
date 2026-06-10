from __future__ import annotations

from typing import Any

from config import FEDEX_DEFAULT_WEIGHT_LB, FEDEX_SERVICE_TYPE
from services.shipping.fedex_client import create_fedex_client
from services.shipping.us_address import USAddress, USContact


def _normalize_phone(phone: str | None, fallback: str = "8005550100") -> str:
    digits = "".join(ch for ch in (phone or "") if ch.isdigit())
    return digits[:15] if digits else fallback


def build_contacts(
    *,
    shipper_name: str,
    shipper_phone: str | None,
    shipper_line1: str,
    shipper_line2: str | None,
    shipper_city: str,
    shipper_state: str,
    shipper_zip: str,
    recipient_name: str,
    recipient_phone: str | None,
    recipient_line1: str,
    recipient_line2: str | None,
    recipient_city: str,
    recipient_state: str,
    recipient_zip: str,
) -> tuple[USContact, USContact]:
    shipper_street = shipper_line1 if not shipper_line2 else f"{shipper_line1}, {shipper_line2}"
    recipient_street = recipient_line1 if not recipient_line2 else f"{recipient_line1}, {recipient_line2}"
    shipper = USContact(
        name=shipper_name,
        phone=_normalize_phone(shipper_phone),
        address=USAddress(
            street=shipper_street,
            city=shipper_city,
            state=shipper_state,
            postal_code=shipper_zip,
        ),
    )
    recipient = USContact(
        name=recipient_name,
        phone=_normalize_phone(recipient_phone),
        address=USAddress(
            street=recipient_street,
            city=recipient_city,
            state=recipient_state,
            postal_code=recipient_zip or "",
        ),
    )
    return shipper, recipient


def create_pharmacy_shipment(
    *,
    shipper_name: str,
    shipper_phone: str | None,
    shipper_line1: str,
    shipper_line2: str | None,
    shipper_city: str,
    shipper_state: str,
    shipper_zip: str,
    recipient_name: str,
    recipient_phone: str | None,
    recipient_line1: str,
    recipient_line2: str | None,
    recipient_city: str,
    recipient_state: str,
    recipient_zip: str,
    weight_lb: float | None = None,
) -> dict[str, Any]:
    shipper, recipient = build_contacts(
        shipper_name=shipper_name,
        shipper_phone=shipper_phone,
        shipper_line1=shipper_line1,
        shipper_line2=shipper_line2,
        shipper_city=shipper_city,
        shipper_state=shipper_state,
        shipper_zip=shipper_zip,
        recipient_name=recipient_name,
        recipient_phone=recipient_phone,
        recipient_line1=recipient_line1,
        recipient_line2=recipient_line2,
        recipient_city=recipient_city,
        recipient_state=recipient_state,
        recipient_zip=recipient_zip,
    )
    client = create_fedex_client()
    result = client.create_shipment(
        shipper,
        recipient,
        weight_lb or FEDEX_DEFAULT_WEIGHT_LB,
        service_type=FEDEX_SERVICE_TYPE,
    )
    tracking_number = client.parse_shipment_tracking(result)
    return {
        "carrier": "fedex",
        "service_type": FEDEX_SERVICE_TYPE,
        "tracking_number": tracking_number,
        "raw_response": result,
    }


def track_pharmacy_shipment(tracking_number: str) -> dict[str, Any]:
    client = create_fedex_client()
    result = client.track_shipment(tracking_number)
    summary = client.parse_track_summary(result)
    summary["carrier"] = "fedex"
    return summary
