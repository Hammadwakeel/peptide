from __future__ import annotations

from fastapi import HTTPException, UploadFile

from db import connect
from repository.products import (
    add_product_image,
    count_products,
    create_category,
    create_product,
    find_category_by_name,
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
from services.gcs_storage import gcs
from services.upload_utils import read_image_upload


def _fmt_product(p: dict, admin: bool = True) -> dict:
    images = p.get("images") or []
    if not images and p.get("image_url"):
        images = [{"url": p["image_url"], "is_primary": True}]
    item = {
        "id": str(p["id"]),
        "name": p["product_name"],
        "slug": p.get("slug"),
        "sku": p["sku"],
        "description": p.get("description"),
        "short_description": (p.get("description") or "")[:160] or None,
        "product_type": p.get("product_type"),
        "form": p.get("form"),
        "strength": p.get("strength"),
        "best_use_within": p.get("best_use_within"),
        "dea_schedule": p.get("dea_schedule"),
        "directions": p.get("directions"),
        "stock_status": p.get("stock_status"),
        "stock_count": p.get("stock_count"),
        "low_stock_threshold": p.get("low_stock_threshold", 10),
        "status": "ACTIVE" if p.get("active", True) else "INACTIVE",
        "category": {
            "id": str(p["category_id"]) if p.get("category_id") else None,
            "name": p.get("category_name"),
            "slug": p.get("category_slug"),
        },
        "variant_id": str(p["variant_id"]) if p.get("variant_id") else None,
        "images": images,
        "coa_doc_url": p.get("coa_doc_url"),
        "created_at": str(p.get("created_at", "")),
    }
    if admin:
        item["clinic_cost"] = float(p["clinic_cost"]) if p.get("clinic_cost") is not None else None
    return item


async def _upload_product_image(product_id: str, image: UploadFile) -> str:
    data, content_type = await read_image_upload(image)
    result = gcs.upload_bytes(
        data,
        filename=image.filename or "product.jpg",
        folder=f"inventory/images/{product_id}",
        content_type=content_type,
        make_public=True,
    )
    return result["url"]


async def create_inventory(body: CreateProductRequest, image: UploadFile | None = None) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        payload = body.model_dump()
        product = create_product(cursor, payload)
        if image and image.filename:
            image_url = await _upload_product_image(str(product["id"]), image)
            upsert_product_image(cursor, str(product["id"]), image_url)
            product["image_url"] = image_url
        conn.commit()
        product = get_product_by_id(cursor, str(product["id"]))
        return {"status": True, "message": "Product added to catalog", "product": _fmt_product(product)}
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
        total = count_products(cursor, product_type=product_type, category_id=category_id,
                               search=search, active_only=False)
        rows = list_products(cursor, pagination.limit, offset,
                             product_type=product_type, category_id=category_id,
                             search=search, active_only=False)
        items = [_fmt_product(r) for r in rows if not stock_status or r.get("stock_status") == stock_status]
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
        return {"status": True, "product": _fmt_product(product)}
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
        data = {k: v for k, v in body.model_dump().items() if v is not None}
        product = update_product(cursor, product_id, data)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        if image and image.filename:
            image_url = await _upload_product_image(product_id, image)
            upsert_product_image(cursor, product_id, image_url)
            product["image_url"] = image_url
        conn.commit()
        product = get_product_by_id(cursor, product_id)
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
        return {"status": True, "message": "Stock updated", "product": _fmt_product(product)}
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


def create_category_entry(body: CreateCategoryRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        if find_category_by_name(cursor, body.name):
            raise HTTPException(status_code=409, detail="Category name already exists")

        category = create_category(cursor, body.model_dump())
        conn.commit()
        return {
            "status": True,
            "message": "Category created",
            "category": {
                "id": str(category["id"]),
                "name": category["name"],
                "slug": category.get("slug"),
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
