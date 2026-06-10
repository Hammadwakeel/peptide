import { ONBOARDING_ENDPOINTS } from "@/lib/apply/endpoints";
import type {
  ApplicationWizardState,
  ApplyClinicResponse,
  UploadDocumentsResponse,
} from "@/lib/apply/types";

function parseApiError(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as { detail?: unknown; message?: unknown };
  if (typeof record.detail === "string") return record.detail;
  if (Array.isArray(record.detail) && record.detail[0]?.msg) {
    return String(record.detail[0].msg);
  }
  if (typeof record.message === "string") return record.message;
  return fallback;
}

function buildAddress(state: ApplicationWizardState): string {
  return [state.practice.address1.trim(), state.practice.address2.trim()]
    .filter(Boolean)
    .join(", ");
}

function buildApplyPayload(state: ApplicationWizardState): URLSearchParams {
  const { practice, banking } = state;
  const params = new URLSearchParams();

  params.set("first_name", practice.firstName.trim());
  params.set("last_name", practice.lastName.trim());
  params.set("email", practice.email.trim().toLowerCase());
  params.set("phone", practice.phone.trim());
  params.set("clinic_name", practice.clinicName.trim());
  params.set("website", practice.website.trim());
  params.set("tax_id", practice.taxId.trim());
  params.set("address", buildAddress(state));
  params.set("city", practice.city.trim());
  params.set("state", practice.state.trim());
  params.set("zip", practice.zip.trim());
  params.set("bank_name", banking.bankName.trim());
  params.set("account_number", banking.accountNumber.trim());
  params.set("account_type", banking.accountType);
  params.set("reseller_permit_number", practice.resellerPermitNumber.trim());

  if (practice.npi.trim()) params.set("npi_number", practice.npi.trim());
  if (practice.dea.trim()) params.set("dea_number", practice.dea.trim());
  if (practice.stateLicense.trim()) {
    params.set("state_license_number", practice.stateLicense.trim());
  }
  if (practice.affiliateCode.trim()) {
    params.set("affiliate_code", practice.affiliateCode.trim());
  }

  return params;
}

export async function submitClinicApplication(
  state: ApplicationWizardState,
): Promise<ApplyClinicResponse> {
  const response = await fetch(ONBOARDING_ENDPOINTS.apply, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: buildApplyPayload(state).toString(),
  });

  const payload = (await response.json().catch(() => null)) as ApplyClinicResponse | null;

  if (!response.ok || !payload?.status || !payload.application?.id) {
    throw new Error(parseApiError(payload, "Unable to submit clinic application."));
  }

  return payload;
}

export async function uploadClinicDocuments(
  clinicId: string,
  documents: ApplicationWizardState["documents"],
): Promise<UploadDocumentsResponse> {
  const resellerPermit = documents.resellerPermit?.file;
  if (!resellerPermit) {
    throw new Error("Reseller permit document is required.");
  }

  const formData = new FormData();
  formData.append("clinic_id", clinicId);
  formData.append("reseller_permit", resellerPermit, resellerPermit.name);

  const clinicLogo = documents.clinicLogo?.file;
  if (clinicLogo) {
    formData.append("clinic_logo", clinicLogo, clinicLogo.name);
  }

  const response = await fetch(ONBOARDING_ENDPOINTS.documents, {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as UploadDocumentsResponse | null;

  if (!response.ok || !payload?.status) {
    throw new Error(parseApiError(payload, "Unable to upload application documents."));
  }

  return payload;
}
