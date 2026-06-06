import { query } from "@frontier/shared/database";
import type { Clinic, ClinicSalesMetrics } from "@frontier/shared/database/types";

export async function findClinicById(id: string): Promise<Clinic | null> {
  const result = await query<Clinic>(
    "SELECT * FROM clinics WHERE id = $1 LIMIT 1",
    [id],
  );
  return result.rows[0] ?? null;
}

export async function listClinicsByAffiliate(affiliateId: string) {
  return query<Clinic>(
    "SELECT * FROM clinics WHERE affiliate_id = $1 ORDER BY created_at DESC",
    [affiliateId],
  );
}

export async function getClinicMetrics(clinicId: string): Promise<ClinicSalesMetrics | null> {
  const result = await query<ClinicSalesMetrics>(
    "SELECT * FROM clinic_sales_metrics WHERE clinic_id = $1",
    [clinicId],
  );
  return result.rows[0] ?? null;
}

export async function listPendingClinics() {
  return query<Clinic>(
    "SELECT * FROM clinics WHERE status = 'pending' ORDER BY created_at ASC",
  );
}
