"use client";

import type { ReactNode } from "react";
import { useShallow } from "@/lib/hooks/zustand";
import { useAdminOrdersStore, useOrdersStore } from "@/stores/orders-store";

export function OrdersProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useOrders() {
  return useOrdersStore(
    useShallow((state) => ({
      orders: state.orders,
      clinicOrders: state.orders,
      isLoading: state.isLoading,
      refreshOrders: state.refreshOrders,
      getOrder: state.getOrder,
      fetchOrder: state.fetchOrder,
      approveOrder: state.approveOrder,
      rejectOrder: state.rejectOrder,
      applyTrackingImport: state.applyTrackingImport,
    })),
  );
}

export function AdminOrdersProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useAdminOrders() {
  return useAdminOrdersStore(
    useShallow((state) => ({
      allOrders: state.allOrders,
      isLoading: state.isLoading,
      refreshOrders: state.refreshOrders,
      toggleFlag: state.toggleFlag,
      bulkUpdateStatus: state.bulkUpdateStatus,
      updateTracking: state.updateTracking,
      applyTrackingImport: state.applyTrackingImport,
    })),
  );
}
