from __future__ import annotations

from fastapi import HTTPException

from db import connect
from repository.products import (
    count_products,
    create_product,
    get_product_by_id,
    list_categories,
    list_products,
    update_product,
)
from schemas.pagination import PaginationQuery, paginated_response
from schemas.products import CreateProductRequest, UpdateProductRequest


def _fmt_product(p: dict, admin: bool = True) -> dict:
    item = {
        "id": str(p["id"]),
        "sku": p["sku"],
        "product_name": p["product_name"],
        "product_type": p.get("product_type"),
        "description": p.get("description"),
        "directions": p.get("directions"),
        "stock_status": p.get("stock_status"),
        "stock_count": p.get("stock_count"),
        "active": p.get("active"),
        "category": {
            "id": str(p["category_id"]) if p.get("category_id") else None,
            "name": p.get("category_name"),
        },
        "variant_id": str(p["variant_id"]) if p.get("variant_id") else None,
        "strength": p.get("strength"),
        "form": p.get("form"),
        "image_url": p.get("image_url"),
        "created_at": str(p.get("created_at", "")),
    }
    if admin:
        item["clinic_cost"] = float(p["clinic_cost"]) if p.get("clinic_cost") is not None else None
    return item


def create_inventory(body: CreateProductRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        product = create_product(cursor, body.model_dump())
        conn.commit()
        return {"status": True, "message": "Product added to inventory", "product": _fmt_product(product)}
    except Exception as exc:
        conn.rollback()
        if "unique" in str(exc).lower() or "duplicate" in str(exc).lower():
            raise HTTPException(status_code=409, detail="SKU already exists") from exc
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


def list_inventory(
    pagination: PaginationQuery,
    product_type: str | None = None,
    category_id: str | None = None,
    search: str | None = None,
) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        offset = (pagination.page - 1) * pagination.limit
        total = count_products(cursor, product_type=product_type, category_id=category_id,
                               search=search, active_only=False)
        rows = list_products(cursor, pagination.limit, offset,
                             product_type=product_type, category_id=category_id,
                             search=search, active_only=False)
        items = [_fmt_product(r) for r in rows]
        return paginated_response(items, total, pagination.page, pagination.limit, key="products")
    finally:
        cursor.close()
        conn.close()


def get_inventory_product(product_id: str) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        product = get_product_by_id(cursor, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"status": True, "product": _fmt_product(product)}
    finally:
        cursor.close()
        conn.close()


def update_inventory(product_id: str, body: UpdateProductRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        data = {k: v for k, v in body.model_dump().items() if v is not None}
        product = update_product(cursor, product_id, data)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        conn.commit()
        return {"status": True, "message": "Product updated", "product": _fmt_product(product)}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


def deactivate_product(product_id: str) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        product = update_product(cursor, product_id, {"active": False})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        conn.commit()
        return {"status": True, "message": "Product deactivated", "product_id": product_id}
    except HTTPException:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


def get_categories() -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        cats = list_categories(cursor)
        return {
            "status": True,
            "categories": [
                {"id": str(c["id"]), "name": c["name"], "slug": c.get("slug")}
                for c in cats
            ],
        }
    finally:
        cursor.close()
        conn.close()
