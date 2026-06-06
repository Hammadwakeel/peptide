/** Row types for all shared PostgreSQL tables, grouped by nano service. */

// --- identity-service ---

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: "super_admin" | "admin" | "clinic_owner" | "clinic_staff" | "patient" | "affiliate";
  status: "active" | "inactive" | "suspended" | "pending";
  email_verified: boolean;
  two_factor_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
}

export interface Session {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
}

// --- commerce-service: clinics ---

export interface Clinic {
  id: string;
  clinic_name: string;
  email: string;
  phone: string | null;
  npi_number: string | null;
  dea_number: string | null;
  status: "active" | "inactive" | "suspended" | "pending";
  affiliate_id: string | null;
  created_at: Date;
}

export interface ClinicStoreProduct {
  id: string;
  clinic_id: string;
  product_id: string;
  variant_id: string | null;
  retail_price: string;
  active: boolean;
}

// --- commerce-service: patients ---

export interface Patient {
  id: string;
  clinic_id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  dob: string | null;
  phone: string | null;
  status: "active" | "inactive" | "suspended" | "pending";
}

export interface PatientRequest {
  id: string;
  clinic_id: string;
  patient_id: string;
  product_id: string;
  request_reason: string;
  status: "pending_review" | "approved" | "rejected" | "cancelled";
}

export interface PatientNote {
  id: string;
  patient_id: string;
  clinic_id: string;
  created_by: string;
  note: string;
  created_at: Date;
}

// --- commerce-service: products ---

export interface Product {
  id: string;
  sku: string;
  product_name: string;
  category_id: string | null;
  product_type: "ruo" | "pharmacy";
  description: string | null;
  stock_status: "in_stock" | "low" | "out_of_stock" | "discontinued";
  active: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  strength: string | null;
  form: string | null;
  clinic_cost: string;
}

// --- commerce-service: orders ---

export interface Order {
  id: string;
  order_number: string;
  clinic_id: string;
  patient_id: string | null;
  order_type: "customer" | "clinic" | "pending_payment";
  payment_status: "pending" | "paid" | "failed" | "refunded" | "partial";
  shipment_status: "pending" | "processing" | "shipped" | "in_transit" | "delivered" | "cancelled";
  total_amount: string;
  net_cost: string;
  profit: string;
  created_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  qty: number;
  unit_price: string;
  total: string;
}

// --- commerce-service: accounting ---

export interface Payout {
  id: string;
  clinic_id: string;
  amount: string;
  payout_status: "pending" | "processing" | "paid" | "failed" | "cancelled";
  payout_date: Date | null;
}

export interface Transaction {
  id: string;
  order_id: string;
  clinic_id: string;
  gross_amount: string;
  fees: string;
  profit: string;
}

// --- commerce-service: affiliate ---

export interface Affiliate {
  id: string;
  user_id: string;
  affiliate_code: string;
  status: "active" | "inactive" | "suspended" | "pending";
}

export interface AffiliateReferral {
  id: string;
  affiliate_id: string;
  clinic_id: string;
  referral_code: string;
  commission: string;
}

// --- communication-service ---

export interface Conversation {
  id: string;
  clinic_id: string;
  patient_id: string;
  status: string;
  created_at: Date;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  message: string;
  is_read: boolean;
  created_at: Date;
}

// --- dashboard views ---

export interface ClinicSalesMetrics {
  clinic_id: string;
  order_count: string;
  total_sales: string;
  total_profit: string;
  avg_order_value: string;
}

/** Table ownership map — which nano service reads/writes each table. */
export const TABLE_OWNERSHIP = {
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
} as const;
