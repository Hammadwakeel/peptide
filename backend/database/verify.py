#!/usr/bin/env python3
"""Verify database connectivity and list all tables by service domain."""

from connection import close_connector, connect

SERVICE_TABLES = {
    "identity-service": [
        "users", "roles", "user_roles", "sessions", "password_reset_tokens",
    ],
    "commerce-service": [
        "affiliates", "clinics", "clinic_addresses", "clinic_users",
        "clinic_branding", "clinic_bank_accounts", "clinic_settings",
        "clinic_invitations", "patients", "patient_addresses",
        "patient_payment_methods", "patient_invites", "patient_subscriptions",
        "patient_profiles", "categories", "products", "product_variants",
        "product_images", "product_prices", "product_inventory",
        "product_coa_documents", "clinic_store_products", "product_favorites",
        "orders", "order_items", "order_tracking", "order_payments",
        "order_refunds", "order_shipment_events", "pending_payment_orders",
        "clinic_bulk_orders", "patient_requests", "patient_notes",
        "payouts", "transactions", "payout_batches", "payout_line_items",
        "affiliate_referrals", "affiliate_commissions", "affiliate_payouts",
        "clinic_documents", "provider_agreements", "liability_waivers",
        "license_verifications", "coa_library", "compliance_flags",
        "admin_audit_logs", "clinic_audit_logs",
    ],
    "communication-service": [
        "conversations", "messages", "message_templates",
    ],
}


def main() -> None:
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("SELECT NOW()")
    print(f"Connected: {cursor.fetchone()[0]}")

    cursor.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
    """)
    existing = {row[0] for row in cursor.fetchall()}

    print(f"\nTotal tables: {len(existing)}")
    print("-" * 50)

    all_expected = set()
    for service, tables in SERVICE_TABLES.items():
        all_expected.update(tables)
        missing = [t for t in tables if t not in existing]
        status = "OK" if not missing else f"MISSING {len(missing)}"
        print(f"\n{service}: {len(tables)} tables — {status}")
        if missing:
            for t in missing:
                print(f"  - {t}")

    extra = existing - all_expected - {"schema_migrations"}
    if extra:
        print(f"\nExtra tables: {', '.join(sorted(extra))}")

    cursor.execute("""
        SELECT table_name
        FROM information_schema.views
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
    views = [row[0] for row in cursor.fetchall()]
    print(f"\nDashboard views ({len(views)}): {', '.join(views)}")

    cursor.close()
    conn.close()
    close_connector()


if __name__ == "__main__":
    main()
