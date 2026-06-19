from __future__ import annotations

from fastapi import HTTPException

from db import connect
from repository.clinic_context import get_patient_clinic
from repository.orders import (
    count_patient_orders,
    create_order,
    get_order_for_patient,
    get_patient_address,
    get_store_line_items,
    insert_order_item,
    insert_patient_address,
    list_order_items,
    list_order_items_for_orders,
    list_order_tracking,
    list_patient_orders,
)
from schemas.orders import CreatePatientOrderRequest
from schemas.pagination import PaginationQuery, paginated_response
from services.order_response import fmt_patient_order, fmt_tracking
from services.shipping.fedex_service import track_pharmacy_shipment


def place_patient_order(user: dict, body: CreatePatientOrderRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        ctx = get_patient_clinic(cursor, user["sub"])
        if not ctx:
            raise HTTPException(status_code=403, detail="No active patient profile found")

        patient_id = str(ctx["patient_id"])
        clinic_id = str(ctx["clinic_id"])

        if body.shipping_address_id:
            address = get_patient_address(cursor, patient_id, body.shipping_address_id)
            if not address:
                raise HTTPException(status_code=404, detail="Shipping address not found")
            patient_address_id = str(address["id"])
        else:
            assert body.shipping_address is not None
            inserted = insert_patient_address(
                cursor,
                patient_id,
                body.shipping_address.model_dump(),
            )
            patient_address_id = str(inserted["id"])

        store_ids = [item.store_id for item in body.items]
        store_rows = get_store_line_items(cursor, clinic_id, store_ids)
        store_by_id = {str(r["store_id"]): r for r in store_rows}
        if len(store_by_id) != len(set(store_ids)):
            raise HTTPException(status_code=400, detail="One or more products are not in your clinic store")

        total_amount = 0.0
        net_cost = 0.0
        line_specs: list[dict] = []
        for item in body.items:
            row = store_by_id[item.store_id]
            unit_price = float(row["retail_price"])
            unit_cost = float(row["clinic_cost"] or 0)
            total_amount += unit_price * item.qty
            net_cost += unit_cost * item.qty
            line_specs.append({
                "product_id": str(row["product_id"]),
                "variant_id": str(row["variant_id"]) if row.get("variant_id") else None,
                "qty": item.qty,
                "unit_price": unit_price,
                "unit_cost": unit_cost,
            })

        order = create_order(
            cursor,
            clinic_id=clinic_id,
            patient_id=patient_id,
            patient_address_id=patient_address_id,
            total_amount=round(total_amount, 2),
            net_cost=round(net_cost, 2),
            notes=body.notes,
        )
        for spec in line_specs:
            insert_order_item(cursor, order_id=str(order["id"]), **spec)
        conn.commit()

        items = list_order_items(cursor, str(order["id"]))
        order["clinic_name"] = ctx["clinic_name"]
        return {
            "status": True,
            "message": "Order submitted for physician review",
            "order": fmt_patient_order(order, items=items),
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


def list_orders_for_patient(
    user: dict, pagination: PaginationQuery, review_status: str | None = None,
) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        ctx = get_patient_clinic(cursor, user["sub"])
        if not ctx:
            raise HTTPException(status_code=403, detail="No active patient profile found")

        patient_id = str(ctx["patient_id"])
        offset = (pagination.page - 1) * pagination.limit
        total = count_patient_orders(cursor, patient_id, review_status)
        rows = list_patient_orders(
            cursor, patient_id, pagination.limit, offset, review_status,
        )
        order_ids = [str(row["id"]) for row in rows]
        items_by_order = list_order_items_for_orders(cursor, order_ids)
        orders = [
            fmt_patient_order(row, items=items_by_order.get(str(row["id"]), []))
            for row in rows
        ]
        return paginated_response(orders, total, pagination.page, pagination.limit, key="orders")
    finally:
        cursor.close()
        conn.close()


def get_patient_order_detail(user: dict, order_id: str) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        ctx = get_patient_clinic(cursor, user["sub"])
        if not ctx:
            raise HTTPException(status_code=403, detail="No active patient profile found")

        order = get_order_for_patient(cursor, order_id, str(ctx["patient_id"]))
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        items = list_order_items(cursor, order_id)
        tracking = list_order_tracking(cursor, order_id)
        return {
            "status": True,
            "order": fmt_patient_order(order, items=items, tracking=tracking),
        }
    finally:
        cursor.close()
        conn.close()


def track_patient_order(user: dict, order_id: str) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        ctx = get_patient_clinic(cursor, user["sub"])
        if not ctx:
            raise HTTPException(status_code=403, detail="No active patient profile found")

        order = get_order_for_patient(cursor, order_id, str(ctx["patient_id"]))
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        tracking_rows = list_order_tracking(cursor, order_id)
        fedex_row = next((t for t in tracking_rows if t.get("carrier") == "fedex" and t.get("tracking_number")), None)
        if not fedex_row:
            return {
                "status": True,
                "order_id": order_id,
                "tracking": [],
                "message": "No FedEx tracking available for this order yet",
            }

        stored = fmt_tracking(fedex_row)
        try:
            summary = track_pharmacy_shipment(str(fedex_row["tracking_number"]))
        except Exception as exc:
            return {
                "status": True,
                "order_id": order_id,
                "tracking_number": fedex_row["tracking_number"],
                "carrier": "fedex",
                "tracking": stored,
                "live_status": None,
                "message": f"Stored tracking available; live FedEx status unavailable ({exc})",
            }
        return {
            "status": True,
            "order_id": order_id,
            "tracking_number": fedex_row["tracking_number"],
            "carrier": "fedex",
            "tracking": stored,
            "live_status": summary,
        }
    except HTTPException:
        raise
    finally:
        cursor.close()
        conn.close()
