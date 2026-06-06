#!/usr/bin/env python3
"""Quick connectivity test for the shared Cloud SQL database."""

from connection import close_connector, connect


def main() -> None:
    conn = connect()
    cursor = conn.cursor()
    cursor.execute("SELECT NOW()")
    print(cursor.fetchone())
    cursor.close()
    conn.close()
    close_connector()


if __name__ == "__main__":
    main()
