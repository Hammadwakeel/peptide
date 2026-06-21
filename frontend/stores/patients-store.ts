"use client";

import { create } from "zustand";
import { fetchAllDoctorPatients } from "@/lib/doctor/api";
import { mapDoctorPatientToPatient } from "@/lib/patients/map-doctor-patient";
import { usePatientRequestsStore } from "@/stores/patient-requests-store";
import type {
  AddPatientPayload,
  Patient,
  PatientNote,
  ProductRequest,
  RequestStatus,
  ShippingAddress,
} from "@/lib/patients/types";
import { patchIfChanged } from "@/lib/cache/set-if-changed";
import { showError } from "@/lib/toast";

function clonePatients(data: Patient[]): Patient[] {
  return data.map((patient) => ({
    ...patient,
    shippingAddresses: patient.shippingAddresses.map((address) => ({ ...address })),
    orders: [...patient.orders],
    chatMessages: [...patient.chatMessages],
    notes: [...patient.notes],
    requests: patient.requests.map((request) => ({ ...request })),
    address: { ...patient.address },
    paymentMethod: { ...patient.paymentMethod },
  }));
}

type RefreshOptions = { force?: boolean };

type PatientsState = {
  patients: Patient[];
  isLoading: boolean;
  isHydrated: boolean;
  refreshInFlight: Promise<void> | null;
  refreshPatients: (options?: RefreshOptions) => Promise<void>;
  reset: () => void;
  syncFromRequests: () => void;
  getPatient: (id: string) => Patient | undefined;
  addPatient: (payload: AddPatientPayload) => Patient;
  addNote: (patientId: string, content: string, author?: string) => void;
  deleteNote: (patientId: string, noteId: string) => void;
  updateRequestStatus: (patientId: string, requestId: string, status: RequestStatus) => void;
  updateShippingAddresses: (patientId: string, addresses: ShippingAddress[]) => void;
  updatePatientContact: (
    patientId: string,
    patch: Partial<Pick<Patient, "name" | "email" | "phone" | "dateOfBirth" | "address">>,
  ) => void;
};

export const usePatientsStore = create<PatientsState>((set, get) => ({
  patients: [],
  isLoading: true,
  isHydrated: false,
  refreshInFlight: null,

  reset: () => set({ patients: [], isLoading: true, isHydrated: false, refreshInFlight: null }),

  refreshPatients: async (options = {}) => {
    const { force = false } = options;
    if (!force && get().isHydrated) return;
    if (get().refreshInFlight) return get().refreshInFlight!;

    const promise = (async () => {
      if (!get().isHydrated) set({ isLoading: true });
      try {
        const rows = await fetchAllDoctorPatients();
        const mapped = rows.map(mapDoctorPatientToPatient);
        const next = clonePatients(usePatientRequestsStore.getState().mergeIntoPatients(mapped));
        set((state) => {
          const patients = patchIfChanged(state.patients, next);
          if (patients === state.patients && state.isHydrated) return state;
          return { patients, isHydrated: true };
        });
      } catch (error) {
        showError(error, "Unable to load patients.");
        if (force) set({ patients: [] });
      } finally {
        set((state) => {
          const patch: Partial<PatientsState> = { refreshInFlight: null };
          if (state.isLoading) patch.isLoading = false;
          return patch;
        });
      }
    })();

    set({ refreshInFlight: promise });
    return promise;
  },

  syncFromRequests: () => {
    set((state) => ({
      patients: clonePatients(usePatientRequestsStore.getState().mergeIntoPatients(state.patients)),
    }));
  },

  getPatient: (id) => get().patients.find((patient) => patient.id === id),

  addPatient: (payload) => {
    const id = `pat-${Date.now()}`;
    const patient: Patient = {
      id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      dateOfBirth: payload.dateOfBirth,
      status: payload.sendInvite ? "inactive" : "active",
      totalOrders: 0,
      lastOrderDate: null,
      address: payload.address,
      shippingAddresses: [
        {
          id: `addr-${Date.now()}`,
          label: "Home",
          ...payload.address,
          isDefault: true,
        },
      ],
      paymentMethod: { brand: "—", last4: "0000", expMonth: 1, expYear: 2030 },
      orders: [],
      chatMessages: [],
      notes: [],
      requests: [],
    };
    set((state) => ({ patients: [patient, ...state.patients] }));
    return patient;
  },

  addNote: (patientId, content, author = "Provider") => {
    const note: PatientNote = {
      id: `note-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      author,
    };
    set((state) => ({
      patients: state.patients.map((patient) =>
        patient.id === patientId ? { ...patient, notes: [note, ...patient.notes] } : patient,
      ),
    }));
  },

  deleteNote: (patientId, noteId) => {
    set((state) => ({
      patients: state.patients.map((patient) =>
        patient.id === patientId
          ? { ...patient, notes: patient.notes.filter((note) => note.id !== noteId) }
          : patient,
      ),
    }));
  },

  updateRequestStatus: (patientId, requestId, status) => {
    set((state) => ({
      patients: state.patients.map((patient) =>
        patient.id === patientId
          ? {
              ...patient,
              requests: patient.requests.map((request) =>
                request.id === requestId ? { ...request, status } : request,
              ),
            }
          : patient,
      ),
    }));
  },

  updateShippingAddresses: (patientId, addresses) => {
    set((state) => ({
      patients: state.patients.map((patient) =>
        patient.id === patientId ? { ...patient, shippingAddresses: addresses } : patient,
      ),
    }));
  },

  updatePatientContact: (patientId, patch) => {
    set((state) => ({
      patients: state.patients.map((patient) =>
        patient.id === patientId ? { ...patient, ...patch } : patient,
      ),
    }));
  },
}));
