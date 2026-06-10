from __future__ import annotations

import re
from typing import Any


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", name.strip().lower()).strip("-")
    return slug or "product"


def _compute_stock_status(stock_count: int, threshold: int) -> str:
    if stock_count <= 0:
        return "out_of_stock"
    if stock_count <= threshold:
        return "low"
    return "in_stock"


def _rows(cursor, rows: list) -> list[dict[str, Any]]:
    cols = [d[0] for d in cursor.description]
    return [dict(zip(cols, r)) for r in rows]


def _row(cursor, row: tuple) -> dict[str, Any]:
    return dict(zip([d[0] for d in cursor.description], row))


def _filters(
    product_type: str | None,
    category_id: str | None,
    search: str | None,
    active_only: bool,
    stock_status: str | None = None,
) -> tuple[str, list]:
    clauses, params = [], []
    if active_only:
        clauses.append("p.active = TRUE")
    if product_type:
        clauses.append("p.product_type = %s::product_type")
        params.append(product_type)
    if category_id:
        clauses.append("p.category_id = %s")
        params.append(category_id)
    if stock_status:
        clauses.append("p.stock_status = %s::stock_status")
        params.append(stock_status)
    if search:
        clauses.append("(p.product_name ILIKE %s OR p.sku ILIKE %s OR p.description ILIKE %s)")
        params.extend([f"%{search}%"] * 3)
    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    return where, params


def count_products(cursor, **filters) -> int:
    where, params = _filters(**filters)
    cursor.execute(f"SELECT COUNT(*) FROM products p {where}", params)
    return cursor.fetchone()[0]


def list_products(cursor, limit: int, offset: int, **filters) -> list[dict[str, Any]]:
    where, params = _filters(**filters)
    cursor.execute(
        f"""
        SELECT p.id, p.sku, p.slug, p.product_name, p.product_type::text AS product_type,
               p.description, p.directions,
               p.stock_status::text AS stock_status, p.stock_count, p.active, p.created_at,
               c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
               pv.id AS variant_id, pv.strength, pv.form, pv.best_use_within,
               pv.dea_schedule, pv.clinic_cost, pi.image_url,
               COALESCE(inv.reorder_level, 10) AS low_stock_threshold
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN LATERAL (
            SELECT id, strength, form, best_use_within, dea_schedule, clinic_cost
            FROM product_variants WHERE product_id = p.id AND active = TRUE
            ORDER BY created_at LIMIT 1
        ) pv ON TRUE
        LEFT JOIN LATERAL (
            SELECT image_url FROM product_images
            WHERE product_id = p.id ORDER BY is_primary DESC, sort_order LIMIT 1
        ) pi ON TRUE
        LEFT JOIN LATERAL (
            SELECT reorder_level FROM product_inventory
            WHERE product_id = p.id ORDER BY updated_at DESC LIMIT 1
        ) inv ON TRUE
        {where}
        ORDER BY p.product_name
        LIMIT %s OFFSET %s
        """,
        [*params, limit, offset],
    )
    return _rows(cursor, cursor.fetchall())


def get_product_by_slug(cursor, slug: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT p.*, c.name AS category_name, c.slug AS category_slug,
               pv.id AS variant_id, pv.strength, pv.form, pv.best_use_within,
               pv.dea_schedule, pv.clinic_cost,
               pi.image_url,
               COALESCE(inv.reorder_level, 10) AS low_stock_threshold
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN LATERAL (
            SELECT * FROM product_variants WHERE product_id = p.id AND active = TRUE
            ORDER BY created_at LIMIT 1
        ) pv ON TRUE
        LEFT JOIN LATERAL (
            SELECT image_url FROM product_images
            WHERE product_id = p.id ORDER BY is_primary DESC, sort_order LIMIT 1
        ) pi ON TRUE
        LEFT JOIN LATERAL (
            SELECT reorder_level FROM product_inventory
            WHERE product_id = p.id ORDER BY updated_at DESC LIMIT 1
        ) inv ON TRUE
        WHERE p.slug = %s OR p.id::text = %s
        LIMIT 1
        """,
        (slug, slug),
    )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None


def get_product_by_id(cursor, product_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT p.*, c.name AS category_name, c.slug AS category_slug,
               pv.id AS variant_id, pv.strength, pv.form, pv.best_use_within,
               pv.dea_schedule, pv.clinic_cost,
               pi.image_url,
               COALESCE(inv.reorder_level, 10) AS low_stock_threshold
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN LATERAL (
            SELECT * FROM product_variants WHERE product_id = p.id AND active = TRUE
            ORDER BY created_at LIMIT 1
        ) pv ON TRUE
        LEFT JOIN LATERAL (
            SELECT image_url FROM product_images
            WHERE product_id = p.id ORDER BY is_primary DESC, sort_order LIMIT 1
        ) pi ON TRUE
        LEFT JOIN LATERAL (
            SELECT reorder_level FROM product_inventory
            WHERE product_id = p.id ORDER BY updated_at DESC LIMIT 1
        ) inv ON TRUE
        WHERE p.id = %s
        """,
        (product_id,),
    )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None


def list_product_images(cursor, product_id: str) -> list[dict[str, Any]]:
    cursor.execute(
        """
        SELECT id, image_url, alt_text, sort_order, is_primary
        FROM product_images WHERE product_id = %s
        ORDER BY is_primary DESC, sort_order ASC
        """,
        (product_id,),
    )
    return _rows(cursor, cursor.fetchall())


def _unique_product_slug(cursor, base_slug: str, sku: str) -> str:
    slug = base_slug or _slugify(sku)
    cursor.execute("SELECT 1 FROM products WHERE slug = %s LIMIT 1", (slug,))
    if cursor.fetchone() is None:
        return slug
    suffix = re.sub(r"[^a-zA-Z0-9]+", "-", sku.strip().lower()).strip("-") or "item"
    return f"{slug}-{suffix}"


def create_product(cursor, data: dict) -> dict[str, Any]:
    slug = _unique_product_slug(
        cursor,
        data.get("slug") or _slugify(data["product_name"]),
        data["sku"],
    )
    stock_status = _compute_stock_status(
        data["stock_count"], data.get("low_stock_threshold", 10),
    )
    cursor.execute(
        """
        INSERT INTO products (sku, slug, product_name, category_id, product_type,
                              description, directions, stock_count, stock_status, active)
        VALUES (%s, %s, %s, %s, %s::product_type, %s, %s, %s, %s::stock_status, TRUE)
        RETURNING id, sku, slug, product_name, product_type::text AS product_type,
                  stock_count, stock_status::text AS stock_status, active
        """,
        (
            data["sku"], slug, data["product_name"], data.get("category_id"),
            data["product_type"], data.get("description"), data.get("directions"),
            data["stock_count"], stock_status,
        ),
    )
    product = _row(cursor, cursor.fetchone())
    cursor.execute(
        """
        INSERT INTO product_variants (product_id, strength, form, best_use_within,
                                      dea_schedule, clinic_cost, active)
        VALUES (%s, %s, %s, %s, %s, %s, TRUE)
        RETURNING id, clinic_cost
        """,
        (
            product["id"], data.get("strength"), data.get("form"),
            data.get("best_use_within"), data.get("dea_schedule"), data["clinic_cost"],
        ),
    )
    variant = _row(cursor, cursor.fetchone())
    product["variant_id"] = variant["id"]
    product["clinic_cost"] = variant["clinic_cost"]
    cursor.execute(
        """
        INSERT INTO product_inventory (product_id, variant_id, quantity_on_hand, reorder_level)
        VALUES (%s, %s, %s, %s)
        """,
        (
            product["id"], variant["id"], data["stock_count"],
            data.get("low_stock_threshold", 10),
        ),
    )
    if data.get("image_url"):
        cursor.execute(
            "INSERT INTO product_images (product_id, image_url, is_primary) VALUES (%s, %s, TRUE)",
            (product["id"], data["image_url"]),
        )
        product["image_url"] = data["image_url"]
    return product


def update_product(cursor, product_id: str, data: dict) -> dict[str, Any] | None:
    fields, params = [], []
    for col in (
        "product_name", "category_id", "description", "directions", "stock_count", "active",
    ):
        if col in data and data[col] is not None:
            fields.append(f"{col} = %s")
            params.append(data[col])
    if "stock_count" in data and data["stock_count"] is not None:
        threshold = data.get("low_stock_threshold", 10)
        fields.append("stock_status = %s::stock_status")
        params.append(_compute_stock_status(data["stock_count"], threshold))
    variant_cols = ("strength", "form", "best_use_within", "dea_schedule", "clinic_cost")
    has_variant_update = any(data.get(col) is not None for col in variant_cols)
    if not fields and not has_variant_update and data.get("low_stock_threshold") is None:
        return get_product_by_id(cursor, product_id)
    if fields:
        fields.append("updated_at = NOW()")
        params.append(product_id)
        cursor.execute(f"UPDATE products SET {', '.join(fields)} WHERE id = %s RETURNING id", params)
        if not cursor.fetchone():
            return None
    if data.get("low_stock_threshold") is not None:
        cursor.execute(
            """
            UPDATE product_inventory SET reorder_level = %s
            WHERE product_id = %s
            """,
            (data["low_stock_threshold"], product_id),
        )
    variant_fields, variant_params = [], []
    for col in variant_cols:
        if col in data and data[col] is not None:
            variant_fields.append(f"{col} = %s")
            variant_params.append(data[col])
    if variant_fields:
        variant_params.append(product_id)
        cursor.execute(
            f"""
            UPDATE product_variants
            SET {", ".join(variant_fields)}
            WHERE product_id = %s AND active = TRUE
            """,
            variant_params,
        )
    return get_product_by_id(cursor, product_id)


def update_product_stock(cursor, product_id: str, stock_count: int, low_stock_threshold: int | None) -> dict[str, Any] | None:
    product = get_product_by_id(cursor, product_id)
    if not product:
        return None
    threshold = low_stock_threshold if low_stock_threshold is not None else product.get("low_stock_threshold", 10)
    stock_status = _compute_stock_status(stock_count, threshold)
    cursor.execute(
        """
        UPDATE products
        SET stock_count = %s, stock_status = %s::stock_status, updated_at = NOW()
        WHERE id = %s
        """,
        (stock_count, stock_status, product_id),
    )
    cursor.execute(
        """
        UPDATE product_inventory SET quantity_on_hand = %s, reorder_level = %s, updated_at = NOW()
        WHERE product_id = %s
        """,
        (stock_count, threshold, product_id),
    )
    return get_product_by_id(cursor, product_id)


def upsert_product_image(cursor, product_id: str, image_url: str) -> None:
    cursor.execute(
        """
        UPDATE product_images SET is_primary = FALSE
        WHERE product_id = %s AND is_primary = TRUE
        """,
        (product_id,),
    )
    cursor.execute(
        """
        INSERT INTO product_images (product_id, image_url, is_primary)
        VALUES (%s, %s, TRUE)
        """,
        (product_id, image_url),
    )


def add_product_image(cursor, product_id: str, image_url: str, *, is_primary: bool = False) -> dict[str, Any]:
    if is_primary:
        cursor.execute(
            "UPDATE product_images SET is_primary = FALSE WHERE product_id = %s",
            (product_id,),
        )
    cursor.execute(
        """
        INSERT INTO product_images (product_id, image_url, is_primary)
        VALUES (%s, %s, %s)
        RETURNING id, image_url, is_primary, sort_order
        """,
        (product_id, image_url, is_primary),
    )
    return _row(cursor, cursor.fetchone())


def get_category_by_id(cursor, category_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT id, name, slug, product_type::text AS product_type, sort_order, active
        FROM categories WHERE id = %s
        """,
        (category_id,),
    )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None


def find_category_by_name(cursor, name: str, product_type: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT id, name, slug, product_type::text AS product_type, sort_order, active
        FROM categories
        WHERE LOWER(name) = LOWER(%s) AND product_type = %s::product_type
        LIMIT 1
        """,
        (name, product_type),
    )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None


def create_category(cursor, data: dict) -> dict[str, Any]:
    slug = data.get("slug") or _slugify(data["name"])
    cursor.execute(
        """
        INSERT INTO categories (name, slug, product_type, description, sort_order, active)
        VALUES (%s, %s, %s::product_type, %s, %s, TRUE)
        RETURNING id, name, slug, product_type::text AS product_type, description, sort_order, active
        """,
        (
            data["name"], slug, data["product_type"],
            data.get("description"), data.get("sort_order", 0),
        ),
    )
    return _row(cursor, cursor.fetchone())


def list_categories(cursor, product_type: str | None = None) -> list[dict[str, Any]]:
    if product_type:
        cursor.execute(
            """
            SELECT id, name, slug, product_type::text AS product_type, sort_order
            FROM categories
            WHERE active = TRUE AND product_type = %s::product_type
            ORDER BY sort_order, name
            """,
            (product_type,),
        )
    else:
        cursor.execute(
            """
            SELECT id, name, slug, product_type::text AS product_type, sort_order
            FROM categories
            WHERE active = TRUE
            ORDER BY product_type, sort_order, name
            """
        )
    return _rows(cursor, cursor.fetchall())
