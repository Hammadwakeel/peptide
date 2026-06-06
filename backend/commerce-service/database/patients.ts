import { query } from "@frontier/shared/database";
import type { Patient, PatientNote, PatientRequest } from "@frontier/shared/database/types";

export async function listPatientsByClinic(clinicId: string, status?: string) {
  if (status) {
    return query<Patient>(
      "SELECT * FROM patients WHERE clinic_id = $1 AND status = $2 ORDER BY last_name, first_name",
      [clinicId, status],
    );
  }
  return query<Patient>(
    "SELECT * FROM patients WHERE clinic_id = $1 ORDER BY last_name, first_name",
    [clinicId],
  );
}

export async function getPatientRequests(clinicId: string, status = "pending_review") {
  return query<PatientRequest>(
    `SELECT pr.*, p.product_name, pt.first_name, pt.last_name
     FROM patient_requests pr
     JOIN products p ON p.id = pr.product_id
     JOIN patients pt ON pt.id = pr.patient_id
     WHERE pr.clinic_id = $1 AND pr.status = $2
     ORDER BY pr.created_at DESC`,
    [clinicId, status],
  );
}

export async function getPatientNotes(patientId: string) {
  return query<PatientNote>(
    "SELECT * FROM patient_notes WHERE patient_id = $1 ORDER BY created_at DESC",
    [patientId],
  );
}
