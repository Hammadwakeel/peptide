from __future__ import annotations

from typing import Any

PRODUCT_TYPES = frozenset({"peptides", "pharmacy"})


def _product_images(p: dict) -> list[dict[str, Any]]:
    images = p.get("images") or []
    if not images and p.get("image_url"):
        return [{"url": p["image_url"], "is_primary": True}]
    return images


def fmt_product(p: dict, *, include_cost: bool = False) -> dict[str, Any]:
    """Shape a catalog product for API responses with type-specific fields only."""
    product_type = p.get("product_type")
    item: dict[str, Any] = {
        "id": str(p["id"]),
        "name": p["product_name"],
        "slug": p.get("slug"),
        "sku": p["sku"],
        "product_type": product_type,
        "description": p.get("description"),
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
        "images": _product_images(p),
        "created_at": str(p.get("created_at", "")),
    }
    if include_cost:
        item["clinic_cost"] = float(p["clinic_cost"]) if p.get("clinic_cost") is not None else None
    if product_type == "peptides":
        item["strength"] = p.get("strength")
        item["form"] = p.get("form")
        item["best_use_within"] = p.get("best_use_within")
    elif product_type == "pharmacy":
        item["dea_schedule"] = p.get("dea_schedule")
    return item


def fmt_store_product(r: dict, *, include_cost: bool = True) -> dict[str, Any]:
    """Shape a clinic My Store row for provider endpoints."""
    item: dict[str, Any] = {
        "store_id": str(r["store_id"]),
        "product_id": str(r["product_id"]),
        "name": r["product_name"],
        "sku": r["sku"],
        "slug": r.get("slug"),
        "product_type": r.get("product_type"),
        "description": r.get("description"),
        "directions": r.get("directions"),
        "category": {
            "id": str(r["category_id"]) if r.get("category_id") else None,
            "name": r.get("category_name"),
            "slug": r.get("category_slug"),
        },
        "stock_status": r.get("stock_status"),
        "stock_count": r.get("stock_count"),
        "low_stock_threshold": r.get("low_stock_threshold", 10),
        "retail_price": float(r["retail_price"]),
        "image_url": r.get("image_url"),
        "images": _product_images(r),
        "is_visible": r.get("is_visible", r.get("store_active", r.get("active", True))),
    }
    if include_cost:
        item["clinic_cost"] = float(r["clinic_cost"]) if r.get("clinic_cost") is not None else None
    product_type = r.get("product_type")
    if product_type == "peptides":
        item["strength"] = r.get("strength")
        item["form"] = r.get("form")
        item["best_use_within"] = r.get("best_use_within")
    elif product_type == "pharmacy":
        item["dea_schedule"] = r.get("dea_schedule")
    return item


def fmt_patient_store_product(r: dict) -> dict[str, Any]:
    """Patient storefront row — retail pricing only, no clinic cost."""
    return fmt_store_product(r, include_cost=False)
