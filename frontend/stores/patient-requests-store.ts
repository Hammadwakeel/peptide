"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductRequest } from "@/lib/patients/types";

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

function toProductRequest(stored: StoredPatientRequest): ProductRequest {
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

type PatientRequestsState = {
  requests: StoredPatientRequest[];
  addRequest: (payload: Omit<StoredPatientRequest, "id" | "dateRequested">) => StoredPatientRequest;
  getRequestsForPatient: (patientId: string) => StoredPatientRequest[];
  mergeIntoPatients: <T extends { id: string; requests: ProductRequest[] }>(patients: T[]) => T[];
};

export const usePatientRequestsStore = create<PatientRequestsState>()(
  persist(
    (set, get) => ({
      requests: [],

      addRequest: (payload) => {
        const request: StoredPatientRequest = {
          id: `req-patient-${Date.now()}`,
          dateRequested: new Date().toISOString().slice(0, 10),
          ...payload,
        };
        set((state) => ({ requests: [request, ...state.requests] }));
        return request;
      },

      getRequestsForPatient: (patientId) =>
        get().requests.filter((request) => request.patientId === patientId),

      mergeIntoPatients: (patients) => {
        const stored = get().requests;
        if (stored.length === 0) return patients;

        return patients.map((patient) => {
          const additions = stored
            .filter((request) => request.patientId === patient.id)
            .map(toProductRequest)
            .filter(
              (request) => !patient.requests.some((existing) => existing.id === request.id),
            );

          if (additions.length === 0) return patient;
          return { ...patient, requests: [...additions, ...patient.requests] };
        });
      },
    }),
    { name: "frontier-patient-product-requests", skipHydration: true },
  ),
);

/** @deprecated Use usePatientRequestsStore instead */
export function addStoredPatientRequest(
  payload: Omit<StoredPatientRequest, "id" | "dateRequested">,
) {
  return usePatientRequestsStore.getState().addRequest(payload);
}

/** @deprecated Use usePatientRequestsStore instead */
export function mergeStoredRequestsIntoPatients<T extends { id: string; requests: ProductRequest[] }>(
  patients: T[],
): T[] {
  return usePatientRequestsStore.getState().mergeIntoPatients(patients);
}
