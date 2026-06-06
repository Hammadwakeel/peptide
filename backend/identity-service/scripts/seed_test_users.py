#!/usr/bin/env python3
"""Seed test users for Swagger / local development."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from auth_utils import hash_password
from db import close_connector, connect

TEST_PASSWORD = "Test1234!"

USERS = {
    "admin": {
        "email": "dev@avishkarai.com",
        "role": "admin",
        "login_role": "admin",
    },
    "clinic": {
        "email": "hasnainnaseer987@gmail.com",
        "role": "clinic_owner",
        "login_role": "doctor",
        "clinic_name": "Hasnain Test Clinic",
    },
    "main_affiliate": {
        "email": "hooriaajmal9@gmail.com",
        "role": "affiliate",
        "login_role": "affiliate",
        "affiliate_code": "MAIN-HOORIA",
        "affiliate_type": "main",
    },
}


def upsert_user(cursor, email: str, role: str) -> str:
    pwd = hash_password(TEST_PASSWORD)
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(%s)", (email,))
    row = cursor.fetchone()
    if row:
        user_id = str(row[0])
        cursor.execute(
            """
            UPDATE users
            SET password_hash = %s, role = %s::user_role, status = 'active',
                email_verified = TRUE, updated_at = NOW()
            WHERE id = %s
            """,
            (pwd, role, user_id),
        )
        print(f"  updated user: {email}")
    else:
        cursor.execute(
            """
            INSERT INTO users (email, password_hash, role, status, email_verified)
            VALUES (%s, %s, %s::user_role, 'active', TRUE)
            RETURNING id
            """,
            (email.lower(), pwd, role),
        )
        user_id = str(cursor.fetchone()[0])
        print(f"  created user: {email}")
    return user_id


def seed_clinic(cursor, user_id: str, cfg: dict) -> None:
    email = cfg["email"]
    cursor.execute("SELECT id FROM clinics WHERE LOWER(email) = LOWER(%s)", (email,))
    row = cursor.fetchone()
    if row:
        clinic_id = str(row[0])
        cursor.execute(
            "UPDATE clinics SET status = 'active', clinic_name = %s, updated_at = NOW() WHERE id = %s",
            (cfg["clinic_name"], clinic_id),
        )
        print(f"  updated clinic: {cfg['clinic_name']}")
    else:
        cursor.execute(
            """
            INSERT INTO clinics (clinic_name, email, phone, status)
            VALUES (%s, %s, '555-0001', 'active')
            RETURNING id
            """,
            (cfg["clinic_name"], email.lower()),
        )
        clinic_id = str(cursor.fetchone()[0])
        cursor.execute(
            "SELECT 1 FROM clinic_addresses WHERE clinic_id = %s LIMIT 1",
            (clinic_id,),
        )
        if not cursor.fetchone():
            cursor.execute(
                """
                INSERT INTO clinic_addresses (clinic_id, address1, city, state, zip, country)
                VALUES (%s, '100 Test St', 'Austin', 'TX', '78701', 'US')
                """,
                (clinic_id,),
            )
        print(f"  created clinic: {cfg['clinic_name']}")

    cursor.execute(
        """
        INSERT INTO clinic_users (clinic_id, user_id, access_level)
        VALUES (%s, %s, 'owner')
        ON CONFLICT (clinic_id, user_id) DO NOTHING
        """,
        (clinic_id, user_id),
    )
    cursor.execute(
        "INSERT INTO clinic_settings (clinic_id) VALUES (%s) ON CONFLICT (clinic_id) DO NOTHING",
        (clinic_id,),
    )
    cursor.execute(
        "INSERT INTO clinic_branding (clinic_id) VALUES (%s) ON CONFLICT (clinic_id) DO NOTHING",
        (clinic_id,),
    )


def seed_main_affiliate(cursor, user_id: str, cfg: dict) -> None:
    cursor.execute("SELECT id FROM affiliates WHERE affiliate_type = 'main' LIMIT 1")
    existing_main = cursor.fetchone()

    cursor.execute(
        "SELECT id FROM affiliates WHERE user_id = %s LIMIT 1",
        (user_id,),
    )
    user_affiliate = cursor.fetchone()

    if existing_main and (not user_affiliate or str(existing_main[0]) != str(user_affiliate[0])):
        cursor.execute(
            "UPDATE affiliates SET affiliate_type = 'sub' WHERE id = %s",
            (str(existing_main[0]),),
        )
        print("  demoted previous main affiliate to sub")

    if user_affiliate:
        cursor.execute(
            """
            UPDATE affiliates
            SET affiliate_code = %s, affiliate_type = 'main', parent_affiliate_id = NULL,
                status = 'active', updated_at = NOW()
            WHERE user_id = %s
            """,
            (cfg["affiliate_code"], user_id),
        )
        print(f"  updated main affiliate: {cfg['affiliate_code']}")
    else:
        cursor.execute(
            """
            INSERT INTO affiliates (user_id, affiliate_code, affiliate_type, status)
            VALUES (%s, %s, 'main', 'active')
            """,
            (user_id, cfg["affiliate_code"]),
        )
        print(f"  created main affiliate: {cfg['affiliate_code']}")


def main() -> None:
    conn = connect()
    cursor = conn.cursor()
    try:
        print("Seeding test users...\n")

        admin_id = upsert_user(cursor, USERS["admin"]["email"], USERS["admin"]["role"])
        clinic_id = upsert_user(cursor, USERS["clinic"]["email"], USERS["clinic"]["role"])
        affiliate_id = upsert_user(
            cursor, USERS["main_affiliate"]["email"], USERS["main_affiliate"]["role"],
        )

        seed_clinic(cursor, clinic_id, USERS["clinic"])
        seed_main_affiliate(cursor, affiliate_id, USERS["main_affiliate"])

        conn.commit()
        print("\n--- Test accounts (password for all: %s) ---" % TEST_PASSWORD)
        for key, cfg in USERS.items():
            print(f"  {key:16} login_role={cfg['login_role']:<10} email={cfg['email']}")
        print("\nSwagger: POST /auth/login → copy token → Authorize button")
        print(f"  Admin:    role=admin,   email={USERS['admin']['email']}")
        print(f"  Clinic:   role=doctor,  email={USERS['clinic']['email']}")
        print(f"  Affiliate: role=affiliate, email={USERS['main_affiliate']['email']}")

    except Exception as exc:
        conn.rollback()
        print(f"Seed failed: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
    finally:
        cursor.close()
        conn.close()
        close_connector()


if __name__ == "__main__":
    main()
