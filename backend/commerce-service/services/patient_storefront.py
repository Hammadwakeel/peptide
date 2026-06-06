from __future__ import annotations

from fastapi import HTTPException

from db import connect
from repository.clinic_context import get_patient_clinic
from repository.clinic_store import count_store_products, list_store_products
from repository.products import get_product_by_id
from schemas.pagination import PaginationQuery, paginated_response


def list_patient_products(
    user: dict, pagination: PaginationQuery, search: str | None = None,
) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        ctx = get_patient_clinic(cursor, user["sub"])
        if not ctx:
            raise HTTPException(status_code=403, detail="No active patient profile found")

        clinic_id = str(ctx["clinic_id"])
        offset = (pagination.page - 1) * pagination.limit
        total = count_store_products(cursor, clinic_id, search)
        rows = list_store_products(
            cursor, clinic_id, pagination.limit, offset, search, include_cost=False,
        )
        items = [
            {
                "store_id": str(r["store_id"]),
                "product_id": str(r["product_id"]),
                "product_name": r["product_name"],
                "description": r.get("description"),
                "product_type": r.get("product_type"),
                "category_name": r.get("category_name"),
                "stock_status": r.get("stock_status"),
                "retail_price": float(r["retail_price"]),
                "image_url": r.get("image_url"),
            }
            for r in rows
        ]
        response = paginated_response(items, total, pagination.page, pagination.limit, key="products")
        response["clinic"] = {
            "id": clinic_id,
            "clinic_name": ctx["clinic_name"],
        }
        return response
    except HTTPException:
        raise
    finally:
        cursor.close()
        conn.close()


def get_patient_product(user: dict, store_id: str) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        ctx = get_patient_clinic(cursor, user["sub"])
        if not ctx:
            raise HTTPException(status_code=403, detail="No active patient profile found")

        clinic_id = str(ctx["clinic_id"])
        cursor.execute(
            """
            SELECT csp.id AS store_id, csp.retail_price,
                   p.id AS product_id, p.product_name, p.description, p.directions,
                   p.product_type::text AS product_type, p.stock_status::text AS stock_status,
                   c.name AS category_name, pv.strength, pv.form, pi.image_url
            FROM clinic_store_products csp
            JOIN products p ON p.id = csp.product_id
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN product_variants pv ON pv.id = csp.variant_id
            LEFT JOIN LATERAL (
                SELECT image_url FROM product_images
                WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1
            ) pi ON TRUE
            WHERE csp.id = %s AND csp.clinic_id = %s AND csp.active = TRUE
            """,
            (store_id, clinic_id),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Product not found in your clinic store")

        cols = [d[0] for d in cursor.description]
        r = dict(zip(cols, row))
        return {
            "status": True,
            "product": {
                "store_id": str(r["store_id"]),
                "product_id": str(r["product_id"]),
                "product_name": r["product_name"],
                "description": r.get("description"),
                "directions": r.get("directions"),
                "product_type": r.get("product_type"),
                "category_name": r.get("category_name"),
                "stock_status": r.get("stock_status"),
                "retail_price": float(r["retail_price"]),
                "strength": r.get("strength"),
                "form": r.get("form"),
                "image_url": r.get("image_url"),
            },
            "clinic": {"id": clinic_id, "clinic_name": ctx["clinic_name"]},
        }
    except HTTPException:
        raise
    finally:
        cursor.close()
        conn.close()
