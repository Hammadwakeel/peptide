from __future__ import annotations

from typing import Any


def fmt_order_item(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(item["id"]),
        "product_id": str(item["product_id"]),
        "variant_id": str(item["variant_id"]) if item.get("variant_id") else None,
        "product_name": item.get("product_name"),
        "product_type": item.get("product_type"),
        "sku": item.get("sku"),
        "qty": item["qty"],
        "unit_price": float(item["unit_price"]),
        "unit_cost": float(item["unit_cost"]),
        "total": float(item["total"]),
    }


def fmt_tracking(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(row["id"]),
        "carrier": row.get("carrier"),
        "tracking_number": row.get("tracking_number"),
        "status": row.get("status"),
        "shipped_at": str(row["shipped_at"]) if row.get("shipped_at") else None,
        "delivered_at": str(row["delivered_at"]) if row.get("delivered_at") else None,
    }


def fmt_patient_order(order: dict[str, Any], *, items: list[dict] | None = None,
                      tracking: list[dict] | None = None) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "id": str(order["id"]),
        "order_number": order["order_number"],
        "clinic_id": str(order["clinic_id"]),
        "clinic_name": order.get("clinic_name"),
        "payment_status": order.get("payment_status"),
        "shipment_status": order.get("shipment_status"),
        "review_status": order.get("review_status"),
        "total_amount": float(order["total_amount"]),
        "notes": order.get("notes"),
        "rejection_reason": order.get("rejection_reason"),
        "shipping_carrier": order.get("shipping_carrier"),
        "created_at": str(order.get("created_at", "")),
        "reviewed_at": str(order["reviewed_at"]) if order.get("reviewed_at") else None,
    }
    if items is not None:
        payload["items"] = [fmt_order_item(i) for i in items]
    if tracking is not None:
        payload["tracking"] = [fmt_tracking(t) for t in tracking]
    return payload


def fmt_clinic_order(order: dict[str, Any], *, items: list[dict] | None = None,
                     tracking: list[dict] | None = None) -> dict[str, Any]:
    patient_name = " ".join(
        part for part in [order.get("first_name"), order.get("last_name")] if part
    ).strip()
    payload = fmt_patient_order(order, items=items, tracking=tracking)
    payload.update({
        "patient_id": str(order["patient_id"]),
        "patient_name": patient_name or None,
        "patient_email": order.get("patient_email"),
        "patient_phone": order.get("patient_phone"),
        "net_cost": float(order["net_cost"]) if order.get("net_cost") is not None else None,
        "profit": float(order["profit"]) if order.get("profit") is not None else None,
    })
    return payload
