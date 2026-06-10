from __future__ import annotations

import os
import uuid

from fastapi import HTTPException, UploadFile

from db import connect
from repository.products import (
    add_product_image,
    count_products,
    create_category,
    create_product,
    find_category_by_name,
    get_category_by_id,
    get_product_by_id,
    list_categories,
    list_product_images,
    list_products,
    update_product,
    update_product_stock,
    upsert_product_image,
)
from schemas.inventory_admin import (
    CreateCategoryRequest,
    CreateProductRequest,
    UpdateProductRequest,
    UpdateStockRequest,
)
from schemas.pagination import PaginationQuery, paginated_response
from services.product_response import fmt_product
from services.storage import public_url, s3
from services.upload_utils import read_image_upload


def _strip_fields_for_product_type(product_type: str, data: dict) -> dict:
    """Drop variant fields that do not apply to the selected product type."""
    cleaned = dict(data)
    if product_type == "peptides":
        cleaned.pop("dea_schedule", None)
    else:
        for key in ("strength", "form", "best_use_within"):
            cleaned.pop(key, None)
    return cleaned


def _require_matching_category(cursor, category_id: str, product_type: str) -> None:
    category = get_category_by_id(cursor, category_id)
    if not category or not category.get("active", True):
        raise HTTPException(status_code=400, detail="Category not found")
    if category.get("product_type") != product_type:
        raise HTTPException(
            status_code=400,
            detail=f"Category belongs to {category.get('product_type')} products, not {product_type}",
        )


async def _upload_product_image(product_id: str, image: UploadFile) -> str:
    data, content_type = await read_image_upload(image)
    ext = os.path.splitext(image.filename or "product.jpg")[1] or ".jpg"
    key = f"inventory/images/{product_id}/{uuid.uuid4().hex}{ext}"
    s3.upload_bytes(data, key, content_type=content_type)
    return public_url(key)


async def create_inventory(body: CreateProductRequest, image: UploadFile | None = None) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        if body.category_id:
            _require_matching_category(cursor, body.category_id, body.product_type)
        payload = _strip_fields_for_product_type(body.product_type, body.model_dump())
        product = create_product(cursor, payload)
        if image and image.filename:
            image_url = await _upload_product_image(str(product["id"]), image)
            upsert_product_image(cursor, str(product["id"]), image_url)
            product["image_url"] = image_url
        conn.commit()
        product = get_product_by_id(cursor, str(product["id"]))
        return {"status": True, "message": "Product added to catalog", "product": fmt_product(product, include_cost=True)}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        if "unique" in str(exc).lower() or "duplicate" in str(exc).lower():
            raise HTTPException(status_code=409, detail="SKU or slug already exists") from exc
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


def list_inventory(
    pagination: PaginationQuery,
    product_type: str | None = None,
    category_id: str | None = None,
    search: str | None = None,
    stock_status: str | None = None,
) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        offset = (pagination.page - 1) * pagination.limit
        filters = {
            "product_type": product_type,
            "category_id": category_id,
            "search": search,
            "active_only": False,
            "stock_status": stock_status,
        }
        total = count_products(cursor, **filters)
        rows = list_products(cursor, pagination.limit, offset, **filters)
        items = [fmt_product(r, include_cost=True) for r in rows]
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
        images = list_product_images(cursor, product_id)
        product["images"] = [{"url": i["image_url"], "is_primary": i["is_primary"]} for i in images]
        return {"status": True, "product": fmt_product(product, include_cost=True)}
    finally:
        cursor.close()
        conn.close()


async def update_inventory(
    product_id: str,
    body: UpdateProductRequest,
    image: UploadFile | None = None,
) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        existing = get_product_by_id(cursor, product_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Product not found")

        data = _strip_fields_for_product_type(
            existing["product_type"],
            {k: v for k, v in body.model_dump().items() if v is not None},
        )
        if data.get("category_id"):
            _require_matching_category(cursor, data["category_id"], existing["product_type"])

        product = update_product(cursor, product_id, data)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        if image and image.filename:
            image_url = await _upload_product_image(product_id, image)
            upsert_product_image(cursor, product_id, image_url)
            product["image_url"] = image_url
        conn.commit()
        product = get_product_by_id(cursor, product_id)
        return {"status": True, "message": "Product updated", "product": fmt_product(product, include_cost=True)}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


def update_stock(product_id: str, body: UpdateStockRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        product = update_product_stock(
            cursor, product_id, body.stock_count, body.low_stock_threshold,
        )
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        conn.commit()
        return {"status": True, "message": "Stock updated", "product": fmt_product(product, include_cost=True)}
    except HTTPException:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


async def upload_product_images(product_id: str, images: list[UploadFile]) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        product = get_product_by_id(cursor, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        uploaded = []
        for idx, image in enumerate(images):
            if not image.filename:
                continue
            image_url = await _upload_product_image(product_id, image)
            row = add_product_image(cursor, product_id, image_url, is_primary=idx == 0 and not uploaded)
            uploaded.append({"id": str(row["id"]), "url": row["image_url"], "is_primary": row["is_primary"]})

        if not uploaded:
            raise HTTPException(status_code=400, detail="At least one image file is required")

        conn.commit()
        return {"status": True, "message": "Product images uploaded", "images": uploaded}
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


def get_categories(product_type: str | None = None) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        cats = list_categories(cursor, product_type)
        return {
            "status": True,
            "categories": [
                {
                    "id": str(c["id"]),
                    "name": c["name"],
                    "slug": c.get("slug"),
                    "product_type": c.get("product_type"),
                    "sort_order": c.get("sort_order"),
                }
                for c in cats
            ],
        }
    finally:
        cursor.close()
        conn.close()


def create_category_entry(body: CreateCategoryRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        if find_category_by_name(cursor, body.name, body.product_type):
            raise HTTPException(
                status_code=409,
                detail=f"Category '{body.name}' already exists for {body.product_type} products",
            )

        category = create_category(cursor, body.model_dump())
        conn.commit()
        return {
            "status": True,
            "message": "Category created",
            "category": {
                "id": str(category["id"]),
                "name": category["name"],
                "slug": category.get("slug"),
                "product_type": category.get("product_type"),
                "description": category.get("description"),
                "sort_order": category.get("sort_order"),
            },
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        if "unique" in str(exc).lower() or "duplicate" in str(exc).lower():
            raise HTTPException(status_code=409, detail="Category name or slug already exists") from exc
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()
