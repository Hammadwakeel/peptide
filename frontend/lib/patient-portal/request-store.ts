import type { ProductRequest } from "@/lib/patients/types";

const STORAGE_KEY = "frontier-patient-product-requests";

export type StoredPatientRequest = {
  id: string;
  patientId: string;
  productId: string;
  productName: string;
  description: string;
  category: string;
  requestReason: string;
  price: number;
  dateRequested: string;
};

function readStore(): StoredPatientRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredPatientRequest[]) : [];
  } catch {
    return [];
  }
}

function writeStore(requests: StoredPatientRequest[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

export function getStoredPatientRequests(): StoredPatientRequest[] {
  return readStore();
}

export function getStoredRequestsForPatient(patientId: string): StoredPatientRequest[] {
  return readStore().filter((request) => request.patientId === patientId);
}

export function addStoredPatientRequest(payload: {
  patientId: string;
  productId: string;
  productName: string;
  description: string;
  category: string;
  requestReason: string;
  price: number;
}): StoredPatientRequest {
  const request: StoredPatientRequest = {
    id: `req-patient-${Date.now()}`,
    dateRequested: new Date().toISOString().slice(0, 10),
    ...payload,
  };
  writeStore([request, ...readStore()]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("patient-requests-updated"));
  }
  return request;
}

export function toProductRequest(stored: StoredPatientRequest): ProductRequest {
  return {
    id: stored.id,
    productName: stored.productName,
    description: stored.description,
    category: stored.category,
    dateRequested: stored.dateRequested,
    doctorName: "Dr. Rivera",
    price: stored.price,
    requestReason: stored.requestReason,
    status: "pending_review",
  };
}

export function mergeStoredRequestsIntoPatients<T extends { id: string; requests: ProductRequest[] }>(
  patients: T[],
): T[] {
  const stored = readStore();
  if (stored.length === 0) return patients;

  return patients.map((patient) => {
    const additions = stored
      .filter((request) => request.patientId === patient.id)
      .map(toProductRequest)
      .filter((request) => !patient.requests.some((existing) => existing.id === request.id));

    if (additions.length === 0) return patient;
    return { ...patient, requests: [...additions, ...patient.requests] };
  });
}
