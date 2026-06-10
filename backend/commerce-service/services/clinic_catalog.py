from __future__ import annotations

from fastapi import HTTPException

from db import connect
from repository.clinic_context import get_clinic_for_user
from repository.clinic_store import (
    add_to_store,
    batch_add_to_store,
    count_store_products,
    get_store_product,
    is_in_store,
    list_store_products,
    remove_all_from_store,
    remove_from_store,
    update_store_price,
)
from repository.products import (
    count_products,
    get_product_by_id,
    get_product_by_slug,
    list_product_images,
    list_products,
)
from schemas.inventory_clinic import (
    AddToStoreRequest,
    BatchAddToStoreRequest,
    SetRetailPriceRequest,
    UpdateStorePriceRequest,
    UpdateStoreVisibilityRequest,
)
from schemas.pagination import PaginationQuery, paginated_response
from services.product_response import fmt_product, fmt_store_product


def _require_clinic(cursor, user: dict) -> dict:
    clinic = get_clinic_for_user(cursor, user["sub"])
    if not clinic:
        raise HTTPException(status_code=403, detail="No active clinic linked to this account")
    return clinic


def list_provider_catalog(
    user: dict,
    pagination: PaginationQuery,
    product_type: str | None = None,
    category_id: str | None = None,
    search: str | None = None,
    stock_status: str | None = None,
) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = _require_clinic(cursor, user)
        offset = (pagination.page - 1) * pagination.limit
        filters = {
            "product_type": product_type,
            "category_id": category_id,
            "search": search,
            "active_only": True,
            "stock_status": stock_status,
        }
        total = count_products(cursor, **filters)
        rows = list_products(cursor, pagination.limit, offset, **filters)
        items = []
        for r in rows:
            item = fmt_product(r, include_cost=True)
            item["in_my_store"] = is_in_store(cursor, str(clinic["id"]), str(r["id"]))
            items.append(item)
        return paginated_response(items, total, pagination.page, pagination.limit, key="products")
    except HTTPException:
        raise
    finally:
        cursor.close()
        conn.close()


def get_provider_catalog_product(user: dict, slug: str) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = _require_clinic(cursor, user)
        product = get_product_by_slug(cursor, slug)
        if not product or not product.get("active", True):
            raise HTTPException(status_code=404, detail="Product not found")

        images = list_product_images(cursor, str(product["id"]))
        product["images"] = [{"url": i["image_url"], "is_primary": i["is_primary"]} for i in images]
        item = fmt_product(product, include_cost=True)
        item["in_my_store"] = is_in_store(cursor, str(clinic["id"]), str(product["id"]))
        return {"status": True, "product": item}
    except HTTPException:
        raise
    finally:
        cursor.close()
        conn.close()


def set_retail_price(user: dict, product_id: str, body: SetRetailPriceRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = _require_clinic(cursor, user)
        product = get_product_by_id(cursor, product_id)
        if not product or not product.get("active", True):
            raise HTTPException(status_code=404, detail="Product not found")

        store_item = add_to_store(
            cursor,
            str(clinic["id"]),
            product_id,
            str(product["variant_id"]) if product.get("variant_id") else None,
            body.retail_price,
        )
        conn.commit()
        return {
            "status": True,
            "message": "Retail price saved",
            "product_id": product_id,
            "retail_price": float(store_item["retail_price"]),
            "store_id": str(store_item["id"]),
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


def list_my_store(user: dict, pagination: PaginationQuery, search: str | None = None) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = _require_clinic(cursor, user)
        clinic_id = str(clinic["id"])
        offset = (pagination.page - 1) * pagination.limit
        total = count_store_products(cursor, clinic_id, search)
        rows = list_store_products(cursor, clinic_id, pagination.limit, offset, search, include_cost=True)
        items = [fmt_store_product(r) for r in rows]
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

        clinic_id = str(clinic["id"])
        variant_id = body.variant_id or (str(product["variant_id"]) if product.get("variant_id") else None)
        store_item = add_to_store(cursor, clinic_id, body.product_id, variant_id, body.retail_price)
        conn.commit()
        row = get_store_product(cursor, clinic_id, str(store_item["id"]), include_cost=True)
        return {
            "status": True,
            "message": "Product added to My Store",
            "store_item": fmt_store_product(row) if row else {
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
        existing = get_store_product(cursor, str(clinic["id"]), store_id, include_cost=True)
        if not existing:
            raise HTTPException(status_code=404, detail="Store product not found")
        updated = update_store_price(
            cursor, store_id, str(clinic["id"]), body.retail_price,
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Store product not found")
        conn.commit()
        existing["retail_price"] = updated["retail_price"]
        return {
            "status": True,
            "message": "Price updated",
            "store_item": fmt_store_product(existing),
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


def update_store_product_visibility(user: dict, store_id: str, body: UpdateStoreVisibilityRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = _require_clinic(cursor, user)
        existing = get_store_product(cursor, str(clinic["id"]), store_id, include_cost=True)
        if not existing:
            raise HTTPException(status_code=404, detail="Store product not found")
        updated = update_store_price(
            cursor,
            store_id,
            str(clinic["id"]),
            existing["retail_price"],
            body.is_visible,
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Store product not found")
        conn.commit()
        existing["is_visible"] = updated["is_visible"]
        return {
            "status": True,
            "message": "Visibility updated",
            "store_item": fmt_store_product(existing),
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


def batch_add_products_to_store(user: dict, body: BatchAddToStoreRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = _require_clinic(cursor, user)
        clinic_id = str(clinic["id"])
        store_items = []
        for item in body.items:
            product = get_product_by_id(cursor, item.product_id)
            if not product or not product.get("active", True):
                raise HTTPException(
                    status_code=404,
                    detail=f"Product not found or inactive: {item.product_id}",
                )
            store_item = add_to_store(
                cursor,
                clinic_id,
                item.product_id,
                item.variant_id or (str(product["variant_id"]) if product.get("variant_id") else None),
                item.retail_price,
            )
            store_items.append({
                "store_id": str(store_item["id"]),
                "product_id": str(store_item["product_id"]),
                "retail_price": float(store_item["retail_price"]),
            })
        conn.commit()
        return {
            "status": True,
            "message": f"Added {len(store_items)} products to My Store",
            "store_items": store_items,
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
