import { ONBOARDING_ENDPOINTS } from "@/lib/apply/endpoints";
import type {
  ApplicationDocumentKey,
  ApplicationDocuments,
  ApplicationWizardState,
  ApplyClinicResponse,
  UploadDocumentsResponse,
} from "@/lib/apply/types";

const DOCUMENT_API_FIELDS: Record<ApplicationDocumentKey, string> = {
  deaLicense: "dea_license",
  npiCertificate: "npi_certificate",
  stateLicense: "state_license",
  businessRegistration: "business_registration",
  clinicLogo: "clinic_logo",
};

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

function buildApplyPayload(state: ApplicationWizardState): URLSearchParams {
  const { practice, banking } = state;
  const params = new URLSearchParams();

  params.set("clinic_name", practice.clinicName.trim());
  params.set("npi_number", practice.npi.trim());
  params.set("dea_number", practice.dea.trim());
  params.set("state_license_number", practice.stateLicense.trim());
  params.set("address1", practice.address1.trim());
  if (practice.address2.trim()) {
    params.set("address2", practice.address2.trim());
  }
  params.set("city", practice.city.trim());
  params.set("state", practice.state.trim());
  params.set("zip", practice.zip.trim());
  params.set("country", practice.country.trim() || "US");
  params.set("phone", practice.phone.trim());
  params.set("primary_contact_name", practice.contactName.trim());
  params.set("email", practice.email.trim().toLowerCase());
  params.set("password", practice.password);
  params.set("bank_name", banking.bankName.trim());
  params.set("routing_number", banking.routingNumber.trim());
  params.set("account_number", banking.accountNumber.trim());
  params.set("account_type", banking.accountType);
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

  const payload = (await response.json().catch(() => null)) as
    | ApplyClinicResponse
    | null;

  if (!response.ok || !payload?.status || !payload.application?.id) {
    throw new Error(parseApiError(payload, "Unable to submit clinic application."));
  }

  return payload;
}

export async function uploadClinicDocuments(
  clinicId: string,
  documents: ApplicationDocuments,
): Promise<UploadDocumentsResponse> {
  const formData = new FormData();
  formData.append("clinic_id", clinicId);

  (Object.entries(documents) as [ApplicationDocumentKey, ApplicationDocuments[ApplicationDocumentKey]][]).forEach(
    ([key, meta]) => {
      if (meta?.file) {
        formData.append(DOCUMENT_API_FIELDS[key], meta.file, meta.file.name);
      }
    },
  );

  const response = await fetch(ONBOARDING_ENDPOINTS.documents, {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | UploadDocumentsResponse
    | null;

  if (!response.ok || !payload?.status) {
    throw new Error(parseApiError(payload, "Unable to upload application documents."));
  }

  return payload;
}
