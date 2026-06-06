-- Link patient invitations to the inviting doctor

ALTER TABLE patient_invites
  ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_patient_invites_doctor ON patient_invites(doctor_id);
