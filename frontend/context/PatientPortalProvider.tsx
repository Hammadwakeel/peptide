"use client";

import type { ReactNode } from "react";
import { useShallow } from "@/lib/hooks/zustand";
import { usePatientPortalStore } from "@/stores/patient-portal-store";

export function PatientPortalProvider({ children }: { children: ReactNode }) {
  return children;
}

export function usePatientPortal() {
  return usePatientPortalStore(
    useShallow((state) => ({
      profile: state.profile,
      pendingOrders: state.pendingOrders,
      historyOrders: state.historyOrders,
      products: state.products,
      productsLoading: state.productsLoading,
      productsError: state.productsError,
      clinicName: state.clinicName,
      ordersLoading: state.ordersLoading,
      refreshOrders: state.refreshOrders,
      placeOrder: state.placeOrder,
      fetchOrderDetail: state.fetchOrderDetail,
      submitProductRequest: state.submitProductRequest,
      updateProfile: state.updateProfile,
      updateAddresses: state.updateAddresses,
      updatePaymentMethods: state.updatePaymentMethods,
      getHistoryOrder: state.getHistoryOrder,
    })),
  );
}
