from __future__ import annotations

from fastapi import HTTPException

from db import connect
from repository.clinic_context import get_patient_clinic
from repository.clinic_store import count_store_products, get_store_product, list_store_products
from schemas.pagination import PaginationQuery, paginated_response
from services.product_response import fmt_patient_store_product


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
        total = count_store_products(cursor, clinic_id, search, for_patient=True)
        rows = list_store_products(
            cursor, clinic_id, pagination.limit, offset, search,
            include_cost=False, for_patient=True,
        )
        items = [fmt_patient_store_product(r) for r in rows]
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
        row = get_store_product(cursor, clinic_id, store_id, include_cost=False, for_patient=True)
        if not row:
            raise HTTPException(status_code=404, detail="Product not found in your clinic store")

        return {
            "status": True,
            "product": fmt_patient_store_product(row),
            "clinic": {"id": clinic_id, "clinic_name": ctx["clinic_name"]},
        }
    except HTTPException:
        raise
    finally:
        cursor.close()
        conn.close()
