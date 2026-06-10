from __future__ import annotations

from fastapi import HTTPException

from config import FEDEX_DEFAULT_WEIGHT_LB
from db import connect
from repository.clinic_context import get_clinic_for_user
from repository.orders import (
    approve_order,
    count_clinic_orders,
    get_clinic_ship_from,
    get_order_for_clinic,
    get_patient_address,
    insert_order_tracking,
    list_clinic_orders,
    list_order_items,
    list_order_tracking,
    reject_order,
)
from schemas.orders import RejectOrderRequest
from schemas.pagination import PaginationQuery, paginated_response
from services.order_response import fmt_clinic_order
from services.shipping.carriers import PEPTIDES_CARRIER, PHARMACY_CARRIER
from services.shipping.fedex_service import create_pharmacy_shipment


def _ship_pharmacy_order(
    cursor,
    order: dict,
    items: list[dict],
) -> dict | None:
    pharmacy_items = [i for i in items if i.get("product_type") == "pharmacy"]
    if not pharmacy_items:
        return None

    ship_from = get_clinic_ship_from(cursor, str(order["clinic_id"]))
    if not ship_from:
        raise HTTPException(
            status_code=400,
            detail="Clinic ship-from address is required before approving pharmacy orders",
        )

    if not order.get("patient_address_id"):
        raise HTTPException(status_code=400, detail="Order is missing a patient shipping address")

    patient_address = get_patient_address(
        cursor, str(order["patient_id"]), str(order["patient_address_id"]),
    )
    if not patient_address:
        raise HTTPException(status_code=400, detail="Patient shipping address not found")

    patient_name = " ".join(
        part for part in [order.get("first_name"), order.get("last_name")] if part
    ).strip() or "Patient"

    weight_lb = max(
        FEDEX_DEFAULT_WEIGHT_LB,
        sum(int(i["qty"]) for i in pharmacy_items) * FEDEX_DEFAULT_WEIGHT_LB,
    )

    shipment = create_pharmacy_shipment(
        shipper_name=ship_from.get("primary_contact_name") or ship_from["clinic_name"],
        shipper_phone=ship_from.get("phone"),
        shipper_line1=ship_from["address1"],
        shipper_line2=ship_from.get("address2"),
        shipper_city=ship_from["city"],
        shipper_state=ship_from["state"],
        shipper_zip=ship_from["zip"],
        recipient_name=patient_name,
        recipient_phone=order.get("patient_phone"),
        recipient_line1=patient_address["address1"],
        recipient_line2=patient_address.get("address2"),
        recipient_city=patient_address["city"],
        recipient_state=patient_address["state"],
        recipient_zip=patient_address["zip"],
        weight_lb=weight_lb,
    )

    tracking = insert_order_tracking(
        cursor,
        order_id=str(order["id"]),
        carrier=PHARMACY_CARRIER,
        tracking_number=shipment["tracking_number"],
        status="shipped",
    )
    return tracking


def list_orders_for_clinic(
    user: dict, pagination: PaginationQuery, review_status: str | None = None,
) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = get_clinic_for_user(cursor, user["sub"])
        if not clinic:
            raise HTTPException(status_code=403, detail="No active clinic found for this user")

        clinic_id = str(clinic["id"])
        offset = (pagination.page - 1) * pagination.limit
        total = count_clinic_orders(cursor, clinic_id, review_status)
        rows = list_clinic_orders(cursor, clinic_id, pagination.limit, offset, review_status)
        orders = [fmt_clinic_order(r) for r in rows]
        response = paginated_response(orders, total, pagination.page, pagination.limit, key="orders")
        response["clinic"] = {"id": clinic_id, "clinic_name": clinic["clinic_name"]}
        return response
    finally:
        cursor.close()
        conn.close()


def get_clinic_order_detail(user: dict, order_id: str) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = get_clinic_for_user(cursor, user["sub"])
        if not clinic:
            raise HTTPException(status_code=403, detail="No active clinic found for this user")

        order = get_order_for_clinic(cursor, order_id, str(clinic["id"]))
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        items = list_order_items(cursor, order_id)
        tracking = list_order_tracking(cursor, order_id)
        return {
            "status": True,
            "order": fmt_clinic_order(order, items=items, tracking=tracking),
        }
    finally:
        cursor.close()
        conn.close()


def approve_clinic_order(user: dict, order_id: str) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = get_clinic_for_user(cursor, user["sub"])
        if not clinic:
            raise HTTPException(status_code=403, detail="No active clinic found for this user")

        clinic_id = str(clinic["id"])
        order = get_order_for_clinic(cursor, order_id, clinic_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if order.get("review_status") != "pending_review":
            raise HTTPException(status_code=409, detail="Order is not pending physician review")

        items = list_order_items(cursor, order_id)
        has_pharmacy = any(i.get("product_type") == "pharmacy" for i in items)
        has_peptides = any(i.get("product_type") == "peptides" for i in items)

        tracking_row = None
        if has_pharmacy:
            tracking_row = _ship_pharmacy_order(cursor, order, items)

        if has_pharmacy and not has_peptides:
            shipment_status = "shipped"
            shipping_carrier = PHARMACY_CARRIER
        elif has_peptides and not has_pharmacy:
            shipment_status = "processing"
            shipping_carrier = PEPTIDES_CARRIER
        else:
            shipment_status = "processing" if has_peptides else "shipped"
            shipping_carrier = PHARMACY_CARRIER if has_pharmacy else PEPTIDES_CARRIER

        updated = approve_order(
            cursor,
            order_id,
            clinic_id,
            user["sub"],
            shipment_status=shipment_status,
            shipping_carrier=shipping_carrier,
        )
        if not updated:
            raise HTTPException(status_code=409, detail="Order could not be approved")

        conn.commit()
        tracking = list_order_tracking(cursor, order_id)
        refreshed = get_order_for_clinic(cursor, order_id, clinic_id)
        message = "Order approved"
        if has_pharmacy and tracking_row:
            message = f"Order approved and FedEx label created ({tracking_row['tracking_number']})"
        elif has_peptides:
            message = "Order approved; peptide shipment will use a separate carrier"

        return {
            "status": True,
            "message": message,
            "order": fmt_clinic_order(refreshed, items=items, tracking=tracking),
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=502, detail=f"Order approval failed: {exc}") from exc
    finally:
        cursor.close()
        conn.close()


def reject_clinic_order(user: dict, order_id: str, body: RejectOrderRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = get_clinic_for_user(cursor, user["sub"])
        if not clinic:
            raise HTTPException(status_code=403, detail="No active clinic found for this user")

        clinic_id = str(clinic["id"])
        updated = reject_order(cursor, order_id, clinic_id, user["sub"], body.reason)
        if not updated:
            raise HTTPException(status_code=409, detail="Order is not pending physician review")

        conn.commit()
        items = list_order_items(cursor, order_id)
        refreshed = get_order_for_clinic(cursor, order_id, clinic_id)
        return {
            "status": True,
            "message": "Order rejected",
            "order": fmt_clinic_order(refreshed, items=items),
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()
