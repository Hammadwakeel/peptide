#!/usr/bin/env python3
"""Seed sample inventory and add products to Hasnain Test Clinic store."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from db import close_connector, connect

SAMPLE_PRODUCTS = [
    {
        "sku": "PEP-BPC157-5MG", "product_name": "BPC-157 5mg", "product_type": "peptides",
        "description": "Body protection compound peptide", "clinic_cost": 82.50,
        "stock_count": 100, "category": "Wellness", "strength": "5mg", "form": "Vial",
    },
    {
        "sku": "PEP-TB500-5MG", "product_name": "TB-500 5mg", "product_type": "peptides",
        "description": "Thymosin beta-4 peptide", "clinic_cost": 94.00,
        "stock_count": 80, "category": "Wellness", "strength": "5mg", "form": "Vial",
    },
    {
        "sku": "PHARM-TRT-CREAM", "product_name": "TRT Testosterone Cream", "product_type": "pharmacy",
        "description": "Compounded testosterone cream", "clinic_cost": 65.00,
        "stock_count": 50, "category": "TRT", "strength": "100mg/g", "form": "Cream",
    },
    {
        "sku": "PHARM-VIT-D3", "product_name": "Vitamin D3 5000IU", "product_type": "pharmacy",
        "description": "High potency vitamin D3", "clinic_cost": 18.50,
        "stock_count": 200, "category": "Wellness", "strength": "5000IU", "form": "Capsule",
    },
]


def main() -> None:
    conn = connect()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM clinics WHERE email = 'hasnainnaseer987@gmail.com' LIMIT 1")
        row = cur.fetchone()
        if not row:
            print("Clinic not found — run identity:seed first")
            return
        clinic_id = str(row[0])

        for p in SAMPLE_PRODUCTS:
            cur.execute("SELECT id FROM categories WHERE name = %s", (p["category"],))
            cat = cur.fetchone()
            cat_id = str(cat[0]) if cat else None

            cur.execute("SELECT id FROM products WHERE sku = %s", (p["sku"],))
            if cur.fetchone():
                print(f"  skip {p['sku']}")
                continue

            cur.execute(
                """
                INSERT INTO products (sku, product_name, category_id, product_type, description,
                                      stock_count, stock_status, active)
                VALUES (%s, %s, %s, %s::product_type, %s, %s, 'in_stock', TRUE)
                RETURNING id
                """,
                (p["sku"], p["product_name"], cat_id, p["product_type"], p["description"], p["stock_count"]),
            )
            product_id = str(cur.fetchone()[0])
            cur.execute(
                """
                INSERT INTO product_variants (product_id, strength, form, clinic_cost, active)
                VALUES (%s, %s, %s, %s, TRUE) RETURNING id
                """,
                (product_id, p["strength"], p["form"], p["clinic_cost"]),
            )
            variant_id = str(cur.fetchone()[0])
            retail = round(float(p["clinic_cost"]) * 1.5, 2)
            cur.execute(
                """
                INSERT INTO clinic_store_products (clinic_id, product_id, variant_id, retail_price, active)
                VALUES (%s, %s, %s, %s, TRUE)
                ON CONFLICT (clinic_id, product_id, variant_id) DO UPDATE
                  SET retail_price = EXCLUDED.retail_price, active = TRUE
                """,
                (clinic_id, product_id, variant_id, retail),
            )
            print(f"  added {p['sku']} → store @ ${retail}")

        conn.commit()
        print(f"\nSeeded {len(SAMPLE_PRODUCTS)} products for Hasnain Test Clinic")
    finally:
        cur.close()
        conn.close()
        close_connector()


if __name__ == "__main__":
    main()
