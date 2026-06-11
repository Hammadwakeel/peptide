export {
  addStoredPatientRequest,
  mergeStoredRequestsIntoPatients,
  usePatientRequestsStore,
  type StoredPatientRequest,
} from "@/stores/patient-requests-store";

import type { ProductRequest } from "@/lib/patients/types";
import {
  usePatientRequestsStore,
  type StoredPatientRequest,
} from "@/stores/patient-requests-store";

export function getStoredPatientRequests(): StoredPatientRequest[] {
  return usePatientRequestsStore.getState().requests;
}

export function getStoredRequestsForPatient(patientId: string): StoredPatientRequest[] {
  return usePatientRequestsStore.getState().getRequestsForPatient(patientId);
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
