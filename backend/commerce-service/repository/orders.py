from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any


def _row(cursor, row: tuple) -> dict[str, Any]:
    return dict(zip([d[0] for d in cursor.description], row))


def _rows(cursor, rows: list) -> list[dict[str, Any]]:
    cols = [d[0] for d in cursor.description]
    return [dict(zip(cols, r)) for r in rows]


def generate_order_number() -> str:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d")
    return f"PNX-{stamp}-{uuid.uuid4().hex[:8].upper()}"


def get_patient_address(cursor, patient_id: str, address_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT id, patient_id, address1, address2, city, state, zip, country, is_default
        FROM patient_addresses
        WHERE id = %s AND patient_id = %s
        """,
        (address_id, patient_id),
    )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None


def insert_patient_address(cursor, patient_id: str, address: dict[str, Any]) -> dict[str, Any]:
    cursor.execute(
        """
        INSERT INTO patient_addresses
            (patient_id, address1, address2, city, state, zip, country, is_default)
        VALUES (%s, %s, %s, %s, %s, %s, %s, FALSE)
        RETURNING id, patient_id, address1, address2, city, state, zip, country, is_default
        """,
        (
            patient_id,
            address["line1"],
            address.get("line2"),
            address["city"],
            address["state"].upper(),
            address["zip"],
            address.get("country", "US"),
        ),
    )
    return _row(cursor, cursor.fetchone())


def get_clinic_ship_from(cursor, clinic_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT ca.id, ca.address1, ca.address2, ca.city, ca.state, ca.zip, ca.country,
               c.clinic_name, c.phone, c.primary_contact_name
        FROM clinic_addresses ca
        JOIN clinics c ON c.id = ca.clinic_id
        WHERE ca.clinic_id = %s
        ORDER BY ca.is_primary DESC, ca.created_at
        LIMIT 1
        """,
        (clinic_id,),
    )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None


def get_store_line_items(
    cursor, clinic_id: str, store_ids: list[str],
) -> list[dict[str, Any]]:
    cursor.execute(
        """
        SELECT csp.id AS store_id, csp.retail_price, csp.variant_id,
               p.id AS product_id, p.product_name, p.product_type::text AS product_type,
               pv.clinic_cost
        FROM clinic_store_products csp
        JOIN products p ON p.id = csp.product_id
        LEFT JOIN LATERAL (
            SELECT id, clinic_cost
            FROM product_variants
            WHERE product_id = p.id AND active = TRUE
              AND (csp.variant_id IS NULL OR id = csp.variant_id)
            ORDER BY (id = csp.variant_id) DESC, created_at
            LIMIT 1
        ) pv ON TRUE
        WHERE csp.clinic_id = %s AND csp.active = TRUE AND csp.id = ANY(%s::uuid[])
        """,
        (clinic_id, store_ids),
    )
    return _rows(cursor, cursor.fetchall())


def create_order(
    cursor,
    *,
    clinic_id: str,
    patient_id: str,
    patient_address_id: str,
    total_amount: float,
    net_cost: float,
    notes: str | None,
) -> dict[str, Any]:
    order_number = generate_order_number()
    profit = round(total_amount - net_cost, 2)
    cursor.execute(
        """
        INSERT INTO orders (
            order_number, clinic_id, patient_id, order_type,
            payment_status, shipment_status, review_status,
            total_amount, net_cost, profit, notes, patient_address_id
        )
        VALUES (%s, %s, %s, 'customer', 'pending', 'pending', 'pending_review',
                %s, %s, %s, %s, %s)
        RETURNING id, order_number, clinic_id, patient_id, order_type::text AS order_type,
                  payment_status::text AS payment_status,
                  shipment_status::text AS shipment_status,
                  review_status::text AS review_status,
                  total_amount, net_cost, profit, notes, patient_address_id, created_at
        """,
        (
            order_number,
            clinic_id,
            patient_id,
            total_amount,
            net_cost,
            profit,
            notes,
            patient_address_id,
        ),
    )
    return _row(cursor, cursor.fetchone())


def insert_order_item(
    cursor,
    *,
    order_id: str,
    product_id: str,
    variant_id: str | None,
    qty: int,
    unit_price: float,
    unit_cost: float,
) -> dict[str, Any]:
    total = round(unit_price * qty, 2)
    cursor.execute(
        """
        INSERT INTO order_items (order_id, product_id, variant_id, qty, unit_price, unit_cost, total)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id, order_id, product_id, variant_id, qty, unit_price, unit_cost, total
        """,
        (order_id, product_id, variant_id, qty, unit_price, unit_cost, total),
    )
    return _row(cursor, cursor.fetchone())


def count_patient_orders(cursor, patient_id: str, review_status: str | None = None) -> int:
    clauses, params = ["o.patient_id = %s"], [patient_id]
    if review_status:
        clauses.append("o.review_status = %s")
        params.append(review_status)
    cursor.execute(
        f"SELECT COUNT(*) FROM orders o WHERE {' AND '.join(clauses)}",
        params,
    )
    return cursor.fetchone()[0]


def list_patient_orders(
    cursor, patient_id: str, limit: int, offset: int, review_status: str | None = None,
) -> list[dict[str, Any]]:
    clauses, params = ["o.patient_id = %s"], [patient_id]
    if review_status:
        clauses.append("o.review_status = %s")
        params.append(review_status)
    cursor.execute(
        f"""
        SELECT o.id, o.order_number, o.clinic_id, o.patient_id,
               o.payment_status::text AS payment_status,
               o.shipment_status::text AS shipment_status,
               o.review_status::text AS review_status,
               o.total_amount, o.notes, o.rejection_reason, o.shipping_carrier,
               o.created_at, o.reviewed_at,
               c.clinic_name
        FROM orders o
        JOIN clinics c ON c.id = o.clinic_id
        WHERE {' AND '.join(clauses)}
        ORDER BY o.created_at DESC
        LIMIT %s OFFSET %s
        """,
        [*params, limit, offset],
    )
    return _rows(cursor, cursor.fetchall())


def count_clinic_orders(cursor, clinic_id: str, review_status: str | None = None) -> int:
    clauses, params = ["o.clinic_id = %s"], [clinic_id]
    if review_status:
        clauses.append("o.review_status = %s")
        params.append(review_status)
    cursor.execute(
        f"SELECT COUNT(*) FROM orders o WHERE {' AND '.join(clauses)}",
        params,
    )
    return cursor.fetchone()[0]


def list_clinic_orders(
    cursor, clinic_id: str, limit: int, offset: int, review_status: str | None = None,
) -> list[dict[str, Any]]:
    clauses, params = ["o.clinic_id = %s"], [clinic_id]
    if review_status:
        clauses.append("o.review_status = %s")
        params.append(review_status)
    cursor.execute(
        f"""
        SELECT o.id, o.order_number, o.clinic_id, o.patient_id,
               o.payment_status::text AS payment_status,
               o.shipment_status::text AS shipment_status,
               o.review_status::text AS review_status,
               o.total_amount, o.notes, o.rejection_reason, o.shipping_carrier,
               o.created_at, o.reviewed_at,
               p.first_name, p.last_name, p.email AS patient_email
        FROM orders o
        JOIN patients p ON p.id = o.patient_id
        WHERE {' AND '.join(clauses)}
        ORDER BY o.created_at DESC
        LIMIT %s OFFSET %s
        """,
        [*params, limit, offset],
    )
    return _rows(cursor, cursor.fetchall())


def get_order_for_patient(cursor, order_id: str, patient_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT o.id, o.order_number, o.clinic_id, o.patient_id,
               o.payment_status::text AS payment_status,
               o.shipment_status::text AS shipment_status,
               o.review_status::text AS review_status,
               o.total_amount, o.net_cost, o.profit, o.notes, o.rejection_reason,
               o.shipping_carrier, o.patient_address_id, o.created_at, o.reviewed_at,
               c.clinic_name
        FROM orders o
        JOIN clinics c ON c.id = o.clinic_id
        WHERE o.id = %s AND o.patient_id = %s
        """,
        (order_id, patient_id),
    )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None


def get_order_for_clinic(cursor, order_id: str, clinic_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT o.id, o.order_number, o.clinic_id, o.patient_id,
               o.payment_status::text AS payment_status,
               o.shipment_status::text AS shipment_status,
               o.review_status::text AS review_status,
               o.total_amount, o.net_cost, o.profit, o.notes, o.rejection_reason,
               o.shipping_carrier, o.patient_address_id, o.created_at, o.reviewed_at,
               p.first_name, p.last_name, p.email AS patient_email, p.phone AS patient_phone
        FROM orders o
        JOIN patients p ON p.id = o.patient_id
        WHERE o.id = %s AND o.clinic_id = %s
        """,
        (order_id, clinic_id),
    )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None


def list_order_items(cursor, order_id: str) -> list[dict[str, Any]]:
    cursor.execute(
        """
        SELECT oi.id, oi.product_id, oi.variant_id, oi.qty,
               oi.unit_price, oi.unit_cost, oi.total,
               p.product_name, p.product_type::text AS product_type, p.sku
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = %s
        ORDER BY p.product_name
        """,
        (order_id,),
    )
    return _rows(cursor, cursor.fetchall())


def list_order_tracking(cursor, order_id: str) -> list[dict[str, Any]]:
    cursor.execute(
        """
        SELECT id, carrier, tracking_number, status, shipped_at, delivered_at, created_at
        FROM order_tracking
        WHERE order_id = %s
        ORDER BY created_at
        """,
        (order_id,),
    )
    return _rows(cursor, cursor.fetchall())


def approve_order(
    cursor,
    order_id: str,
    clinic_id: str,
    reviewer_id: str,
    *,
    shipment_status: str,
    shipping_carrier: str | None,
) -> dict[str, Any] | None:
    cursor.execute(
        """
        UPDATE orders
        SET review_status = 'approved',
            reviewed_by = %s,
            reviewed_at = NOW(),
            shipment_status = %s,
            shipping_carrier = %s,
            updated_at = NOW()
        WHERE id = %s AND clinic_id = %s AND review_status = 'pending_review'
        RETURNING id, order_number, review_status::text AS review_status,
                  shipment_status::text AS shipment_status, shipping_carrier
        """,
        (reviewer_id, shipment_status, shipping_carrier, order_id, clinic_id),
    )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None


def reject_order(
    cursor,
    order_id: str,
    clinic_id: str,
    reviewer_id: str,
    reason: str,
) -> dict[str, Any] | None:
    cursor.execute(
        """
        UPDATE orders
        SET review_status = 'rejected',
            reviewed_by = %s,
            reviewed_at = NOW(),
            rejection_reason = %s,
            shipment_status = 'cancelled',
            updated_at = NOW()
        WHERE id = %s AND clinic_id = %s AND review_status = 'pending_review'
        RETURNING id, order_number, review_status::text AS review_status,
                  rejection_reason, shipment_status::text AS shipment_status
        """,
        (reviewer_id, reason, order_id, clinic_id),
    )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None


def insert_order_tracking(
    cursor,
    *,
    order_id: str,
    carrier: str,
    tracking_number: str,
    status: str = "shipped",
) -> dict[str, Any]:
    cursor.execute(
        """
        INSERT INTO order_tracking (order_id, carrier, tracking_number, status, shipped_at)
        VALUES (%s, %s, %s, %s, NOW())
        RETURNING id, order_id, carrier, tracking_number, status, shipped_at
        """,
        (order_id, carrier, tracking_number, status),
    )
    return _row(cursor, cursor.fetchone())
