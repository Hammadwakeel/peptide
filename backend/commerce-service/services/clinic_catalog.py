from __future__ import annotations

from fastapi import HTTPException

from db import connect
from repository.clinic_context import get_clinic_for_user
from repository.clinic_store import (
    add_to_store,
    count_store_products,
    is_in_store,
    list_store_products,
    remove_all_from_store,
    remove_from_store,
    update_store_price,
)
from repository.products import count_products, get_product_by_id, list_products
from schemas.pagination import PaginationQuery, paginated_response
from schemas.products import AddToStoreRequest, UpdateStorePriceRequest
from services.admin_inventory import _fmt_product


def _require_clinic(cursor, user: dict) -> dict:
    clinic = get_clinic_for_user(cursor, user["sub"])
    if not clinic:
        raise HTTPException(status_code=403, detail="No active clinic linked to this account")
    return clinic


def list_master_inventory(
    user: dict, pagination: PaginationQuery,
    product_type: str | None = None, category_id: str | None = None, search: str | None = None,
) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = _require_clinic(cursor, user)
        offset = (pagination.page - 1) * pagination.limit
        total = count_products(cursor, product_type=product_type, category_id=category_id,
                               search=search, active_only=True)
        rows = list_products(cursor, pagination.limit, offset,
                             product_type=product_type, category_id=category_id,
                             search=search, active_only=True)
        items = []
        for r in rows:
            item = _fmt_product(r)
            item["in_my_store"] = is_in_store(cursor, str(clinic["id"]), str(r["id"]))
            items.append(item)
        return paginated_response(items, total, pagination.page, pagination.limit, key="products")
    except HTTPException:
        raise
    finally:
        cursor.close()
        conn.close()


def list_my_store(
    user: dict, pagination: PaginationQuery, search: str | None = None,
) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = _require_clinic(cursor, user)
        clinic_id = str(clinic["id"])
        offset = (pagination.page - 1) * pagination.limit
        total = count_store_products(cursor, clinic_id, search)
        rows = list_store_products(cursor, clinic_id, pagination.limit, offset, search, include_cost=True)
        items = [
            {
                "store_id": str(r["store_id"]),
                "product_id": str(r["product_id"]),
                "sku": r["sku"],
                "product_name": r["product_name"],
                "description": r.get("description"),
                "product_type": r.get("product_type"),
                "category_name": r.get("category_name"),
                "stock_status": r.get("stock_status"),
                "stock_count": r.get("stock_count"),
                "clinic_cost": float(r["clinic_cost"]) if r.get("clinic_cost") else None,
                "retail_price": float(r["retail_price"]),
                "image_url": r.get("image_url"),
            }
            for r in rows
        ]
        response = paginated_response(items, total, pagination.page, pagination.limit, key="products")
        response["clinic_id"] = clinic_id
        response["clinic_name"] = clinic["clinic_name"]
        return response
    except HTTPException:
        raise
    finally:
        cursor.close()
        conn.close()


def add_product_to_store(user: dict, body: AddToStoreRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = _require_clinic(cursor, user)
        product = get_product_by_id(cursor, body.product_id)
        if not product or not product.get("active", True):
            raise HTTPException(status_code=404, detail="Product not found or inactive")

        store_item = add_to_store(
            cursor, str(clinic["id"]), body.product_id,
            body.variant_id or (str(product["variant_id"]) if product.get("variant_id") else None),
            body.retail_price,
        )
        conn.commit()
        return {
            "status": True,
            "message": "Product added to My Store",
            "store_item": {
                "store_id": str(store_item["id"]),
                "product_id": str(store_item["product_id"]),
                "retail_price": float(store_item["retail_price"]),
            },
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


def update_store_product_price(user: dict, store_id: str, body: UpdateStorePriceRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = _require_clinic(cursor, user)
        updated = update_store_price(
            cursor, store_id, str(clinic["id"]), body.retail_price, body.active,
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Store product not found")
        conn.commit()
        return {
            "status": True,
            "message": "Price updated",
            "store_item": {
                "store_id": str(updated["id"]),
                "retail_price": float(updated["retail_price"]),
                "active": updated["active"],
            },
        }
    except HTTPException:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


def remove_store_product(user: dict, store_id: str) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = _require_clinic(cursor, user)
        if not remove_from_store(cursor, store_id, str(clinic["id"])):
            raise HTTPException(status_code=404, detail="Store product not found")
        conn.commit()
        return {"status": True, "message": "Product removed from My Store"}
    except HTTPException:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


def remove_all_store_products(user: dict) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = _require_clinic(cursor, user)
        count = remove_all_from_store(cursor, str(clinic["id"]))
        conn.commit()
        return {"status": True, "message": f"Removed {count} products from My Store", "removed_count": count}
    except HTTPException:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()
