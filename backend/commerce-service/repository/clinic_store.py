from __future__ import annotations

from typing import Any


def _rows(cursor, rows: list) -> list[dict[str, Any]]:
    cols = [d[0] for d in cursor.description]
    return [dict(zip(cols, r)) for r in rows]


def _row(cursor, row: tuple) -> dict[str, Any]:
    return dict(zip([d[0] for d in cursor.description], row))


def count_store_products(cursor, clinic_id: str, search: str | None = None) -> int:
    clauses, params = ["csp.clinic_id = %s"], [clinic_id]
    if search:
        clauses.append("(p.product_name ILIKE %s OR p.sku ILIKE %s)")
        params.extend([f"%{search}%", f"%{search}%"])
    cursor.execute(
        f"""
        SELECT COUNT(*) FROM clinic_store_products csp
        JOIN products p ON p.id = csp.product_id
        WHERE {' AND '.join(clauses)} AND csp.active = TRUE
        """,
        params,
    )
    return cursor.fetchone()[0]


def list_store_products(
    cursor, clinic_id: str, limit: int, offset: int,
    search: str | None = None, include_cost: bool = True,
) -> list[dict[str, Any]]:
    cost_col = "pv.clinic_cost," if include_cost else ""
    clauses, params = ["csp.clinic_id = %s", "csp.active = TRUE"], [clinic_id]
    if search:
        clauses.append("(p.product_name ILIKE %s OR p.sku ILIKE %s)")
        params.extend([f"%{search}%", f"%{search}%"])
    cursor.execute(
        f"""
        SELECT csp.id AS store_id, csp.retail_price, csp.active AS store_active,
               p.id AS product_id, p.sku, p.product_name, p.description,
               p.product_type::text AS product_type, p.stock_status::text AS stock_status,
               p.stock_count, {cost_col}
               c.name AS category_name, pv.id AS variant_id,
               pi.image_url
        FROM clinic_store_products csp
        JOIN products p ON p.id = csp.product_id
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN product_variants pv ON pv.id = csp.variant_id
        LEFT JOIN LATERAL (
            SELECT image_url FROM product_images
            WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1
        ) pi ON TRUE
        WHERE {' AND '.join(clauses)}
        ORDER BY p.product_name
        LIMIT %s OFFSET %s
        """,
        [*params, limit, offset],
    )
    return _rows(cursor, cursor.fetchall())


def add_to_store(cursor, clinic_id: str, product_id: str, variant_id: str | None, retail_price) -> dict:
    cursor.execute(
        """
        INSERT INTO clinic_store_products (clinic_id, product_id, variant_id, retail_price, active)
        VALUES (%s, %s, %s, %s, TRUE)
        ON CONFLICT (clinic_id, product_id, variant_id)
        DO UPDATE SET retail_price = EXCLUDED.retail_price, active = TRUE, updated_at = NOW()
        RETURNING id, clinic_id, product_id, variant_id, retail_price, active
        """,
        (clinic_id, product_id, variant_id, retail_price),
    )
    return _row(cursor, cursor.fetchone())


def update_store_price(cursor, store_id: str, clinic_id: str, retail_price, active: bool | None) -> dict | None:
    if active is not None:
        cursor.execute(
            """
            UPDATE clinic_store_products
            SET retail_price = %s, active = %s, updated_at = NOW()
            WHERE id = %s AND clinic_id = %s
            RETURNING id, retail_price, active
            """,
            (retail_price, active, store_id, clinic_id),
        )
    else:
        cursor.execute(
            """
            UPDATE clinic_store_products
            SET retail_price = %s, updated_at = NOW()
            WHERE id = %s AND clinic_id = %s
            RETURNING id, retail_price, active
            """,
            (retail_price, store_id, clinic_id),
        )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None


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


def is_in_store(cursor, clinic_id: str, product_id: str) -> bool:
    cursor.execute(
        "SELECT 1 FROM clinic_store_products WHERE clinic_id = %s AND product_id = %s AND active = TRUE LIMIT 1",
        (clinic_id, product_id),
    )
    return cursor.fetchone() is not None
