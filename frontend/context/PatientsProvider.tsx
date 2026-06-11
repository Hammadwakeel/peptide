"use client";

import { useEffect, type ReactNode } from "react";
import { useShallow } from "@/lib/hooks/zustand";
import { usePatientRequestsStore } from "@/stores/patient-requests-store";
import { usePatientsStore } from "@/stores/patients-store";

export function PatientsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const syncFromRequests = () => usePatientsStore.getState().syncFromRequests();
    syncFromRequests();

    const unsubscribe = usePatientRequestsStore.subscribe((state, prev) => {
      if (state.requests !== prev.requests) {
        syncFromRequests();
      }
    });

    return unsubscribe;
  }, []);

  return children;
}

export function usePatients() {
  return usePatientsStore(
    useShallow((state) => ({
      patients: state.patients,
      isLoading: state.isLoading,
      refreshPatients: state.refreshPatients,
      getPatient: state.getPatient,
      addPatient: state.addPatient,
      addNote: state.addNote,
      deleteNote: state.deleteNote,
      updateRequestStatus: state.updateRequestStatus,
      updateShippingAddresses: state.updateShippingAddresses,
      updatePatientContact: state.updatePatientContact,
    })),
  );
}
