#!/usr/bin/env python3
"""Apply SQL migrations to the shared Cloud SQL database."""

from __future__ import annotations

import sys
from pathlib import Path

from connection import close_connector, connect

SCHEMA_DIR = Path(__file__).resolve().parent / "schema"


def ensure_migrations_table(cursor) -> None:
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id         SERIAL PRIMARY KEY,
            version    VARCHAR(50) UNIQUE NOT NULL,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)


def is_applied(cursor, version: str) -> bool:
    cursor.execute(
        "SELECT 1 FROM schema_migrations WHERE version = %s",
        (version,),
    )
    return cursor.fetchone() is not None


def apply_migration(cursor, path: Path) -> None:
    version = path.stem
    if is_applied(cursor, version):
        print(f"  skip  {version} (already applied)")
        return

    sql = path.read_text(encoding="utf-8")
    print(f"  apply {version} ...")
    cursor.execute(sql)
    cursor.execute(
        "INSERT INTO schema_migrations (version) VALUES (%s)",
        (version,),
    )
    print(f"  done  {version}")


def main() -> int:
    migrations = sorted(SCHEMA_DIR.glob("*.sql"))
    if not migrations:
        print("No migration files found.")
        return 1

    print(f"Connecting to database ...")
    conn = connect()
    conn.autocommit = False
    cursor = conn.cursor()

    try:
        ensure_migrations_table(cursor)
        conn.commit()

        print(f"Running {len(migrations)} migration(s):")
        for path in migrations:
            apply_migration(cursor, path)
            conn.commit()

        cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
        table_count = cursor.fetchone()[0]
        print(f"\nMigration complete. Public tables: {table_count}")
        return 0

    except Exception as exc:
        conn.rollback()
        print(f"\nMigration failed: {exc}", file=sys.stderr)
        return 1

    finally:
        cursor.close()
        conn.close()
        close_connector()


if __name__ == "__main__":
    raise SystemExit(main())
