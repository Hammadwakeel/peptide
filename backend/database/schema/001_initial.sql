-- Frontier Nexus Rx — Unified PostgreSQL Schema
-- Single database shared by identity, commerce, and communication services.
-- ~54 tables + dashboard views for multi-tenant healthcare commerce.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- ENUM types
-- ---------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM (
  'super_admin', 'admin', 'clinic_owner', 'clinic_staff', 'patient', 'affiliate'
);

CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended', 'pending');

CREATE TYPE order_type AS ENUM ('customer', 'clinic', 'pending_payment');

CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partial');

CREATE TYPE shipment_status AS ENUM ('pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled');

CREATE TYPE request_status AS ENUM ('pending_review', 'approved', 'rejected', 'cancelled');

CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'cancelled');

CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected', 'expired');

CREATE TYPE product_type AS ENUM ('ruo', 'pharmacy');

CREATE TYPE stock_status AS ENUM ('in_stock', 'low', 'out_of_stock', 'discontinued');

-- ---------------------------------------------------------------------------
-- AUTH MODULE (identity-service) — 5 tables
-- ---------------------------------------------------------------------------

CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               VARCHAR(255) UNIQUE NOT NULL,
  password_hash       TEXT NOT NULL,
  role                user_role NOT NULL,
  status              account_status NOT NULL DEFAULT 'active',
  email_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_secret   TEXT,
  last_login_at       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id    UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role_id)
);

CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    TEXT NOT NULL UNIQUE,
  ip_address    INET,
  user_agent    TEXT,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE password_reset_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- CLINIC MODULE (commerce-service) — 8 tables
-- ---------------------------------------------------------------------------

CREATE TABLE affiliates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  affiliate_code VARCHAR(100) UNIQUE NOT NULL,
  status         account_status NOT NULL DEFAULT 'active',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clinics (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name  VARCHAR(255) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  phone        VARCHAR(50),
  npi_number   VARCHAR(50),
  dea_number   VARCHAR(50),
  status       account_status NOT NULL DEFAULT 'pending',
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clinic_addresses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id  UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  address1   TEXT NOT NULL,
  address2   TEXT,
  city       VARCHAR(100) NOT NULL,
  state      VARCHAR(100) NOT NULL,
  zip        VARCHAR(20) NOT NULL,
  country    VARCHAR(100) NOT NULL DEFAULT 'US',
  is_primary BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clinic_users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id    UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_level VARCHAR(50) NOT NULL DEFAULT 'staff',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (clinic_id, user_id)
);

CREATE TABLE clinic_branding (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   UUID NOT NULL UNIQUE REFERENCES clinics(id) ON DELETE CASCADE,
  logo_url    TEXT,
  theme_color VARCHAR(50) DEFAULT '#1a365d',
  tagline     TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clinic_bank_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  bank_name       VARCHAR(255) NOT NULL,
  account_last4   VARCHAR(10) NOT NULL,
  routing_last4   VARCHAR(10),
  stripe_account_id TEXT,
  payout_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clinic_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id             UUID NOT NULL UNIQUE REFERENCES clinics(id) ON DELETE CASCADE,
  notification_email    BOOLEAN NOT NULL DEFAULT TRUE,
  notification_sms      BOOLEAN NOT NULL DEFAULT FALSE,
  auto_approve_requests BOOLEAN NOT NULL DEFAULT FALSE,
  payout_schedule_days  INTEGER NOT NULL DEFAULT 3,
  timezone              VARCHAR(50) DEFAULT 'America/New_York',
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clinic_invitations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id  UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  email      VARCHAR(255) NOT NULL,
  role       VARCHAR(50) NOT NULL DEFAULT 'staff',
  token_hash TEXT NOT NULL UNIQUE,
  status     VARCHAR(50) NOT NULL DEFAULT 'pending',
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- PATIENT MODULE (commerce-service) — 6 tables
-- ---------------------------------------------------------------------------

CREATE TABLE patients (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id  UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,
  email      VARCHAR(255),
  dob        DATE,
  phone      VARCHAR(50),
  status     account_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE patient_addresses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  address1   TEXT NOT NULL,
  address2   TEXT,
  city       VARCHAR(100) NOT NULL,
  state      VARCHAR(100) NOT NULL,
  zip        VARCHAR(20) NOT NULL,
  country    VARCHAR(100) NOT NULL DEFAULT 'US',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE patient_payment_methods (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id               UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL,
  card_brand               VARCHAR(50),
  card_last4               VARCHAR(10),
  is_default               BOOLEAN NOT NULL DEFAULT FALSE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE patient_invites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id  UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  email      VARCHAR(255) NOT NULL,
  status     VARCHAR(50) NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE patient_subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  product_id      UUID,
  variant_id      UUID,
  frequency_days  INTEGER NOT NULL DEFAULT 30,
  status          VARCHAR(50) NOT NULL DEFAULT 'active',
  next_order_date DATE,
  paused_at       TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE patient_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
  gender          VARCHAR(20),
  allergies       TEXT,
  medications     TEXT,
  medical_history TEXT,
  emergency_contact_name  VARCHAR(200),
  emergency_contact_phone VARCHAR(50),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- PRODUCT CATALOG MODULE (commerce-service) — 8 tables
-- ---------------------------------------------------------------------------

CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) UNIQUE NOT NULL,
  slug        VARCHAR(255) UNIQUE,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku           VARCHAR(100) UNIQUE NOT NULL,
  product_name  VARCHAR(255) NOT NULL,
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  product_type  product_type NOT NULL DEFAULT 'ruo',
  description   TEXT,
  directions    TEXT,
  stock_status  stock_status NOT NULL DEFAULT 'in_stock',
  stock_count   INTEGER NOT NULL DEFAULT 0,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_variants (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  strength         VARCHAR(255),
  form             VARCHAR(100),
  best_use_within  VARCHAR(100),
  dea_schedule     VARCHAR(50),
  clinic_cost      NUMERIC(12,2) NOT NULL DEFAULT 0,
  sku_suffix       VARCHAR(50),
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  alt_text   VARCHAR(255),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_prices (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  qty        INTEGER NOT NULL,
  price      NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (variant_id, qty)
);

CREATE TABLE product_inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id      UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity_on_hand INTEGER NOT NULL DEFAULT 0,
  reorder_level   INTEGER NOT NULL DEFAULT 10,
  lot_number      VARCHAR(100),
  expires_at      DATE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_coa_documents (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  lot_number VARCHAR(100),
  file_url   TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clinic_store_products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id    UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id   UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  retail_price NUMERIC(12,2) NOT NULL,
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (clinic_id, product_id, variant_id)
);

CREATE TABLE product_favorites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id  UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (clinic_id, product_id)
);

-- ---------------------------------------------------------------------------
-- ORDERS MODULE (commerce-service) — 8 tables
-- ---------------------------------------------------------------------------

CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     VARCHAR(100) UNIQUE NOT NULL,
  clinic_id        UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
  patient_id       UUID REFERENCES patients(id) ON DELETE SET NULL,
  order_type       order_type NOT NULL DEFAULT 'customer',
  payment_status   payment_status NOT NULL DEFAULT 'pending',
  shipment_status  shipment_status NOT NULL DEFAULT 'pending',
  total_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_cost         NUMERIC(12,2) NOT NULL DEFAULT 0,
  profit           NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes            TEXT,
  payment_date     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  qty        INTEGER NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  unit_cost  NUMERIC(12,2) NOT NULL DEFAULT 0,
  total      NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_tracking (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  carrier         VARCHAR(100),
  tracking_number VARCHAR(255),
  status          VARCHAR(100) NOT NULL DEFAULT 'pending',
  shipped_at      TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_payments (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                 UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  amount                   NUMERIC(12,2) NOT NULL,
  status                   payment_status NOT NULL DEFAULT 'pending',
  paid_at                  TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_refunds (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount     NUMERIC(12,2) NOT NULL,
  reason     TEXT,
  status     VARCHAR(50) NOT NULL DEFAULT 'pending',
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_shipment_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tracking_id UUID REFERENCES order_tracking(id) ON DELETE CASCADE,
  event_type  VARCHAR(100) NOT NULL,
  location    VARCHAR(255),
  description TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pending_payment_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  payment_link    TEXT,
  reminder_sent_at TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clinic_bulk_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  shipping_address_id UUID REFERENCES clinic_addresses(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- PATIENT REQUESTS & NOTES (commerce-service)
-- ---------------------------------------------------------------------------

CREATE TABLE patient_requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id      UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  request_reason TEXT NOT NULL,
  status         request_status NOT NULL DEFAULT 'pending_review',
  reviewed_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE patient_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id  UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  note       TEXT NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- CHAT MODULE (communication-service) — 3 tables (PostgreSQL unified)
-- ---------------------------------------------------------------------------

CREATE TABLE conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id  UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  status     VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (clinic_id, patient_id)
);

CREATE TABLE messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  message          TEXT NOT NULL,
  is_read          BOOLEAN NOT NULL DEFAULT FALSE,
  read_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE message_templates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id  UUID REFERENCES clinics(id) ON DELETE CASCADE,
  label      VARCHAR(255) NOT NULL,
  content    TEXT NOT NULL,
  role       VARCHAR(50) NOT NULL DEFAULT 'patient',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- ACCOUNTING MODULE (commerce-service) — 4 tables
-- ---------------------------------------------------------------------------

CREATE TABLE payouts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id     UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
  amount        NUMERIC(12,2) NOT NULL,
  payout_status payout_status NOT NULL DEFAULT 'pending',
  payout_date   TIMESTAMPTZ,
  stripe_transfer_id TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  clinic_id     UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
  gross_amount  NUMERIC(12,2) NOT NULL,
  fees          NUMERIC(12,2) NOT NULL DEFAULT 0,
  profit        NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payout_batches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number VARCHAR(100) UNIQUE NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status       payout_status NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payout_line_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id   UUID NOT NULL REFERENCES payout_batches(id) ON DELETE CASCADE,
  payout_id  UUID NOT NULL REFERENCES payouts(id) ON DELETE RESTRICT,
  amount     NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- AFFILIATE MODULE (commerce-service) — 4 tables
-- ---------------------------------------------------------------------------

CREATE TABLE affiliate_referrals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id  UUID NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  clinic_id     UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
  referral_code VARCHAR(100) NOT NULL,
  commission    NUMERIC(12,2) NOT NULL DEFAULT 0,
  status        VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (affiliate_id, clinic_id)
);

CREATE TABLE affiliate_commissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id  UUID NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  order_id      UUID REFERENCES orders(id) ON DELETE SET NULL,
  clinic_id     UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
  amount        NUMERIC(12,2) NOT NULL,
  rate_percent  NUMERIC(5,2),
  status        VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE affiliate_payouts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id  UUID NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  amount        NUMERIC(12,2) NOT NULL,
  payout_status payout_status NOT NULL DEFAULT 'pending',
  payout_date   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- COMPLIANCE MODULE (commerce-service) — 6 tables
-- ---------------------------------------------------------------------------

CREATE TABLE clinic_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id     UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  file_url      TEXT NOT NULL,
  status        document_status NOT NULL DEFAULT 'pending',
  reviewed_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at   TIMESTAMPTZ,
  expires_at    DATE,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE provider_agreements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id  UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  version    VARCHAR(50) NOT NULL,
  file_url   TEXT,
  signed_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  signed_at  TIMESTAMPTZ,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE liability_waivers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id  UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  signed_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  signed_at  TIMESTAMPTZ,
  file_url   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE license_verifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id     UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  license_type  VARCHAR(100) NOT NULL,
  license_number VARCHAR(100) NOT NULL,
  state         VARCHAR(50),
  status        document_status NOT NULL DEFAULT 'pending',
  verified_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at   TIMESTAMPTZ,
  expires_at    DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE coa_library (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  lot_number  VARCHAR(100) NOT NULL,
  file_url    TEXT NOT NULL,
  test_date   DATE,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE compliance_flags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   UUID REFERENCES clinics(id) ON DELETE CASCADE,
  entity_type VARCHAR(100) NOT NULL,
  entity_id   UUID,
  flag_type   VARCHAR(100) NOT NULL,
  description TEXT,
  severity    VARCHAR(50) NOT NULL DEFAULT 'medium',
  resolved    BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- AUDIT MODULE (identity + commerce) — 2 tables
-- ---------------------------------------------------------------------------

CREATE TABLE admin_audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action      TEXT NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id   UUID,
  metadata    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clinic_audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id   UUID,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- INDEXES — multi-tenant performance
-- ---------------------------------------------------------------------------

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_clinics_affiliate ON clinics(affiliate_id);
CREATE INDEX idx_clinics_status ON clinics(status);
CREATE INDEX idx_patients_clinic ON patients(clinic_id);
CREATE INDEX idx_patients_user ON patients(user_id);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_orders_clinic ON orders(clinic_id);
CREATE INDEX idx_orders_patient ON orders(patient_id);
CREATE INDEX idx_orders_status ON orders(payment_status, shipment_status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_clinic_store_clinic ON clinic_store_products(clinic_id);
CREATE INDEX idx_conversations_clinic_patient ON conversations(clinic_id, patient_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_patient_requests_clinic ON patient_requests(clinic_id, status);
CREATE INDEX idx_payouts_clinic ON payouts(clinic_id);
CREATE INDEX idx_transactions_clinic ON transactions(clinic_id);
CREATE INDEX idx_transactions_order ON transactions(order_id);
CREATE INDEX idx_admin_audit_created ON admin_audit_logs(created_at DESC);
CREATE INDEX idx_clinic_audit_clinic ON clinic_audit_logs(clinic_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- UPDATED_AT trigger
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_clinics_updated BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_patients_updated BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_clinic_store_updated BEFORE UPDATE ON clinic_store_products
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_conversations_updated BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_patient_notes_updated BEFORE UPDATE ON patient_notes
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ---------------------------------------------------------------------------
-- DASHBOARD VIEWS (computed metrics — no separate tables)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW clinic_sales_metrics AS
SELECT
  o.clinic_id,
  COUNT(o.id)                                              AS order_count,
  COALESCE(SUM(o.total_amount), 0)                         AS total_sales,
  COALESCE(SUM(o.profit), 0)                               AS total_profit,
  COALESCE(AVG(o.total_amount), 0)                          AS avg_order_value
FROM orders o
WHERE o.payment_status = 'paid'
GROUP BY o.clinic_id;

CREATE OR REPLACE VIEW clinic_revenue_trend AS
SELECT
  o.clinic_id,
  DATE_TRUNC('day', o.created_at) AS period,
  SUM(o.total_amount)             AS revenue,
  SUM(o.profit)                   AS profit,
  COUNT(o.id)                     AS order_count
FROM orders o
WHERE o.payment_status = 'paid'
GROUP BY o.clinic_id, DATE_TRUNC('day', o.created_at);

CREATE OR REPLACE VIEW top_products_by_profit AS
SELECT
  o.clinic_id,
  p.id          AS product_id,
  p.product_name,
  SUM(oi.total) AS total_revenue,
  SUM(oi.total - (oi.unit_cost * oi.qty)) AS total_profit,
  SUM(oi.qty)   AS units_sold
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN products p ON p.id = oi.product_id
WHERE o.payment_status = 'paid'
GROUP BY o.clinic_id, p.id, p.product_name;

CREATE OR REPLACE VIEW patient_lifetime_value AS
SELECT
  p.id          AS patient_id,
  p.clinic_id,
  p.first_name,
  p.last_name,
  COUNT(o.id)   AS total_orders,
  COALESCE(SUM(o.total_amount), 0) AS lifetime_value,
  MAX(o.created_at)                AS last_order_at
FROM patients p
LEFT JOIN orders o ON o.patient_id = p.id AND o.payment_status = 'paid'
GROUP BY p.id, p.clinic_id, p.first_name, p.last_name;

CREATE OR REPLACE VIEW platform_gmv AS
SELECT
  DATE_TRUNC('month', o.created_at) AS month,
  SUM(o.total_amount)               AS gmv,
  SUM(o.profit)                     AS platform_profit,
  COUNT(DISTINCT o.clinic_id)       AS active_clinics,
  COUNT(o.id)                       AS order_count
FROM orders o
WHERE o.payment_status = 'paid'
GROUP BY DATE_TRUNC('month', o.created_at);

-- ---------------------------------------------------------------------------
-- SEED: default roles
-- ---------------------------------------------------------------------------

INSERT INTO roles (name, description) VALUES
  ('super_admin',  'Platform super administrator'),
  ('admin',        'Frontier Nexus internal admin'),
  ('clinic_owner', 'Clinic owner / provider'),
  ('clinic_staff', 'Clinic staff member'),
  ('patient',      'Patient customer'),
  ('affiliate',    'Affiliate partner')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, slug, sort_order) VALUES
  ('Anti Aging',  'anti-aging',  1),
  ('Hormone',     'hormone',     2),
  ('TRT',         'trt',         3),
  ('Women',       'women',       4),
  ('Men',         'men',         5),
  ('Energy',      'energy',      6),
  ('Wellness',    'wellness',    7)
ON CONFLICT (name) DO NOTHING;

INSERT INTO message_templates (label, content, role, sort_order)
SELECT * FROM (VALUES
  ('Prescription question', 'I have a question about my prescription', 'patient', 1),
  ('Test results',          'Can you explain my test results?', 'patient', 2),
  ('Follow-up',             'I need to schedule a follow-up', 'patient', 3),
  ('Side effects',          'I''m experiencing side effects', 'patient', 4)
) AS v(label, content, role, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM message_templates LIMIT 1);
