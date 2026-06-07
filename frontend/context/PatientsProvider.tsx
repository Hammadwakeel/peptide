"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MOCK_PATIENTS } from "@/lib/patients/mock-data";
import { mergeStoredRequestsIntoPatients } from "@/lib/patient-portal/request-store";
import type {
  AddPatientPayload,
  Patient,
  PatientNote,
  ProductRequest,
  RequestStatus,
  ShippingAddress,
} from "@/lib/patients/types";

type PatientsContextValue = {
  patients: Patient[];
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

const PatientsContext = createContext<PatientsContextValue | null>(null);

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

export function PatientsProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(() =>
    clonePatients(mergeStoredRequestsIntoPatients(MOCK_PATIENTS)),
  );

  useEffect(() => {
    function syncFromStorage() {
      setPatients((current) => clonePatients(mergeStoredRequestsIntoPatients(current)));
    }
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener("patient-requests-updated", syncFromStorage);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener("patient-requests-updated", syncFromStorage);
    };
  }, []);

  const getPatient = useCallback(
    (id: string) => patients.find((patient) => patient.id === id),
    [patients],
  );

  const addPatient = useCallback((payload: AddPatientPayload) => {
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
    setPatients((current) => [patient, ...current]);
    return patient;
  }, []);

  const addNote = useCallback((patientId: string, content: string, author = "Dr. Rivera") => {
    const note: PatientNote = {
      id: `note-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      author,
    };
    setPatients((current) =>
      current.map((patient) =>
        patient.id === patientId ? { ...patient, notes: [note, ...patient.notes] } : patient,
      ),
    );
  }, []);

  const deleteNote = useCallback((patientId: string, noteId: string) => {
    setPatients((current) =>
      current.map((patient) =>
        patient.id === patientId
          ? { ...patient, notes: patient.notes.filter((note) => note.id !== noteId) }
          : patient,
      ),
    );
  }, []);

  const updateRequestStatus = useCallback(
    (patientId: string, requestId: string, status: RequestStatus) => {
      setPatients((current) =>
        current.map((patient) =>
          patient.id === patientId
            ? {
                ...patient,
                requests: patient.requests.map((request) =>
                  request.id === requestId ? { ...request, status } : request,
                ),
              }
            : patient,
        ),
      );
    },
    [],
  );

  const updateShippingAddresses = useCallback((patientId: string, addresses: ShippingAddress[]) => {
    setPatients((current) =>
      current.map((patient) =>
        patient.id === patientId ? { ...patient, shippingAddresses: addresses } : patient,
      ),
    );
  }, []);

  const updatePatientContact = useCallback(
    (
      patientId: string,
      patch: Partial<Pick<Patient, "name" | "email" | "phone" | "dateOfBirth" | "address">>,
    ) => {
      setPatients((current) =>
        current.map((patient) =>
          patient.id === patientId ? { ...patient, ...patch } : patient,
        ),
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      patients,
      getPatient,
      addPatient,
      addNote,
      deleteNote,
      updateRequestStatus,
      updateShippingAddresses,
      updatePatientContact,
    }),
    [
      patients,
      getPatient,
      addPatient,
      addNote,
      deleteNote,
      updateRequestStatus,
      updateShippingAddresses,
      updatePatientContact,
    ],
  );

  return <PatientsContext.Provider value={value}>{children}</PatientsContext.Provider>;
}

export function usePatients() {
  const context = useContext(PatientsContext);
  if (!context) {
    throw new Error("usePatients must be used within PatientsProvider");
  }
  return context;
}
