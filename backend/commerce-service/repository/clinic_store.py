from __future__ import annotations

from typing import Any


def _rows(cursor, rows: list) -> list[dict[str, Any]]:
    cols = [d[0] for d in cursor.description]
    return [dict(zip(cols, r)) for r in rows]


def _row(cursor, row: tuple) -> dict[str, Any]:
    return dict(zip([d[0] for d in cursor.description], row))


def count_store_products(
    cursor, clinic_id: str, search: str | None = None, *, for_patient: bool = False,
) -> int:
    clauses, params = ["csp.clinic_id = %s", "csp.active = TRUE"], [clinic_id]
    if for_patient:
        clauses.append("csp.is_visible = TRUE")
    if search:
        clauses.append("(p.product_name ILIKE %s OR p.sku ILIKE %s)")
        params.extend([f"%{search}%", f"%{search}%"])
    cursor.execute(
        f"""
        SELECT COUNT(*) FROM clinic_store_products csp
        JOIN products p ON p.id = csp.product_id
        WHERE {' AND '.join(clauses)}
        """,
        params,
    )
    return cursor.fetchone()[0]


def list_store_products(
    cursor, clinic_id: str, limit: int, offset: int,
    search: str | None = None, include_cost: bool = True, *, for_patient: bool = False,
) -> list[dict[str, Any]]:
    cost_col = "pv.clinic_cost," if include_cost else ""
    clauses, params = ["csp.clinic_id = %s", "csp.active = TRUE"], [clinic_id]
    if for_patient:
        clauses.append("csp.is_visible = TRUE")
    if search:
        clauses.append("(p.product_name ILIKE %s OR p.sku ILIKE %s)")
        params.extend([f"%{search}%", f"%{search}%"])
    cursor.execute(
        f"""
        SELECT csp.id AS store_id, csp.retail_price, csp.active AS store_active,
               csp.is_visible,
               p.id AS product_id, p.sku, p.slug, p.product_name, p.description, p.directions,
               p.product_type::text AS product_type,
               p.stock_status::text AS stock_status, p.stock_count,
               COALESCE(inv.reorder_level, 10) AS low_stock_threshold, {cost_col}
               c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
               pv.id AS variant_id, pv.strength, pv.form, pv.best_use_within,
               pv.dea_schedule, pi.image_url
        FROM clinic_store_products csp
        JOIN products p ON p.id = csp.product_id
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN LATERAL (
            SELECT id, strength, form, best_use_within, dea_schedule, clinic_cost
            FROM product_variants
            WHERE product_id = p.id AND active = TRUE
              AND (csp.variant_id IS NULL OR id = csp.variant_id)
            ORDER BY (id = csp.variant_id) DESC, created_at
            LIMIT 1
        ) pv ON TRUE
        LEFT JOIN LATERAL (
            SELECT image_url FROM product_images
            WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1
        ) pi ON TRUE
        LEFT JOIN LATERAL (
            SELECT reorder_level FROM product_inventory
            WHERE product_id = p.id ORDER BY updated_at DESC LIMIT 1
        ) inv ON TRUE
        WHERE {' AND '.join(clauses)}
        ORDER BY p.product_name
        LIMIT %s OFFSET %s
        """,
        [*params, limit, offset],
    )
    return _rows(cursor, cursor.fetchall())


def _resolve_variant_id(cursor, product_id: str, variant_id: str | None) -> str | None:
    if variant_id:
        return variant_id
    cursor.execute(
        """
        SELECT id FROM product_variants
        WHERE product_id = %s AND active = TRUE
        ORDER BY created_at LIMIT 1
        """,
        (product_id,),
    )
    row = cursor.fetchone()
    return str(row[0]) if row else None


def _find_store_row(cursor, clinic_id: str, product_id: str, variant_id: str | None) -> tuple | None:
    if variant_id:
        cursor.execute(
            """
            SELECT id FROM clinic_store_products
            WHERE clinic_id = %s AND product_id = %s AND variant_id = %s
            LIMIT 1
            """,
            (clinic_id, product_id, variant_id),
        )
    else:
        cursor.execute(
            """
            SELECT id FROM clinic_store_products
            WHERE clinic_id = %s AND product_id = %s AND variant_id IS NULL
            LIMIT 1
            """,
            (clinic_id, product_id),
        )
    return cursor.fetchone()


def add_to_store(cursor, clinic_id: str, product_id: str, variant_id: str | None, retail_price) -> dict:
    variant_id = _resolve_variant_id(cursor, product_id, variant_id)
    existing = _find_store_row(cursor, clinic_id, product_id, variant_id)
    if existing:
        cursor.execute(
            """
            UPDATE clinic_store_products
            SET retail_price = %s, active = TRUE, is_visible = TRUE, updated_at = NOW()
            WHERE id = %s
            RETURNING id, clinic_id, product_id, variant_id, retail_price, active, is_visible
            """,
            (retail_price, existing[0]),
        )
    else:
        cursor.execute(
            """
            INSERT INTO clinic_store_products (clinic_id, product_id, variant_id, retail_price, active, is_visible)
            VALUES (%s, %s, %s, %s, TRUE, TRUE)
            RETURNING id, clinic_id, product_id, variant_id, retail_price, active, is_visible
            """,
            (clinic_id, product_id, variant_id, retail_price),
        )
    return _row(cursor, cursor.fetchone())


def update_store_price(
    cursor, store_id: str, clinic_id: str, retail_price, is_visible: bool | None = None,
) -> dict | None:
    if is_visible is not None:
        cursor.execute(
            """
            UPDATE clinic_store_products
            SET retail_price = %s, is_visible = %s, updated_at = NOW()
            WHERE id = %s AND clinic_id = %s AND active = TRUE
            RETURNING id, retail_price, active, is_visible
            """,
            (retail_price, is_visible, store_id, clinic_id),
        )
    else:
        cursor.execute(
            """
            UPDATE clinic_store_products
            SET retail_price = %s, updated_at = NOW()
            WHERE id = %s AND clinic_id = %s AND active = TRUE
            RETURNING id, retail_price, active, is_visible
            """,
            (retail_price, store_id, clinic_id),
        )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None


def batch_add_to_store(cursor, clinic_id: str, items: list[dict]) -> list[dict]:
    results = []
    for item in items:
        results.append(
            add_to_store(
                cursor,
                clinic_id,
                item["product_id"],
                item.get("variant_id"),
                item["retail_price"],
            ),
        )
    return results


def remove_from_store(cursor, store_id: str, clinic_id: str) -> bool:
    cursor.execute(
        "UPDATE clinic_store_products SET active = FALSE, updated_at = NOW() WHERE id = %s AND clinic_id = %s",
        (store_id, clinic_id),
    )
    return cursor.rowcount > 0


def remove_all_from_store(cursor, clinic_id: str) -> int:
    cursor.execute(
        "UPDATE clinic_store_products SET active = FALSE, updated_at = NOW() WHERE clinic_id = %s AND active = TRUE",
        (clinic_id,),
    )
    return cursor.rowcount


def get_store_product(
    cursor, clinic_id: str, store_id: str, *, include_cost: bool = True, for_patient: bool = False,
) -> dict[str, Any] | None:
    cost_col = "pv.clinic_cost," if include_cost else ""
    cursor.execute(
        f"""
        SELECT csp.id AS store_id, csp.retail_price, csp.active AS store_active,
               csp.is_visible,
               p.id AS product_id, p.sku, p.slug, p.product_name, p.description, p.directions,
               p.product_type::text AS product_type,
               p.stock_status::text AS stock_status, p.stock_count,
               COALESCE(inv.reorder_level, 10) AS low_stock_threshold, {cost_col}
               c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
               pv.id AS variant_id, pv.strength, pv.form, pv.best_use_within,
               pv.dea_schedule, pi.image_url
        FROM clinic_store_products csp
        JOIN products p ON p.id = csp.product_id
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN LATERAL (
            SELECT id, strength, form, best_use_within, dea_schedule, clinic_cost
            FROM product_variants
            WHERE product_id = p.id AND active = TRUE
              AND (csp.variant_id IS NULL OR id = csp.variant_id)
            ORDER BY (id = csp.variant_id) DESC, created_at
            LIMIT 1
        ) pv ON TRUE
        LEFT JOIN LATERAL (
            SELECT image_url FROM product_images
            WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1
        ) pi ON TRUE
        LEFT JOIN LATERAL (
            SELECT reorder_level FROM product_inventory
            WHERE product_id = p.id ORDER BY updated_at DESC LIMIT 1
        ) inv ON TRUE
        WHERE csp.id = %s AND csp.clinic_id = %s AND csp.active = TRUE
          AND (%s = FALSE OR csp.is_visible = TRUE)
        """,
        (store_id, clinic_id, for_patient),
    )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None


def is_in_store(cursor, clinic_id: str, product_id: str) -> bool:
    cursor.execute(
        "SELECT 1 FROM clinic_store_products WHERE clinic_id = %s AND product_id = %s AND active = TRUE LIMIT 1",
        (clinic_id, product_id),
    )
    return cursor.fetchone() is not None
