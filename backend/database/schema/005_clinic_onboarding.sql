-- Module M2: Provider onboarding application fields and status tracking

ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS primary_contact_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS state_license_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS application_status VARCHAR(50) NOT NULL DEFAULT 'submitted',
  ADD COLUMN IF NOT EXISTS application_password_hash TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS admin_note TEXT;

CREATE TABLE IF NOT EXISTS clinic_banking_details (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id         UUID NOT NULL UNIQUE REFERENCES clinics(id) ON DELETE CASCADE,
  bank_name         VARCHAR(255) NOT NULL,
  account_type      VARCHAR(20) NOT NULL DEFAULT 'checking',
  encrypted_routing TEXT NOT NULL,
  encrypted_account TEXT NOT NULL,
  routing_last4     VARCHAR(4),
  account_last4     VARCHAR(4),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinics_application_status ON clinics(application_status);
