"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  BROWSE_PRODUCTS,
  DEMO_PATIENT_PROFILE,
  INITIAL_HISTORY_ORDERS,
  INITIAL_PENDING_ORDERS,
} from "@/lib/patient-portal/mock-data";
import { addStoredPatientRequest } from "@/lib/patient-portal/request-store";
import type {
  BrowseProduct,
  PatientHistoryOrder,
  PatientPendingOrder,
  PatientProfile,
  PatientShippingAddress,
  PatientPaymentMethod,
} from "@/lib/patient-portal/types";

type PatientPortalContextValue = {
  profile: PatientProfile;
  pendingOrders: PatientPendingOrder[];
  historyOrders: PatientHistoryOrder[];
  products: BrowseProduct[];
  removePendingOrder: (id: string) => void;
  markOrderPaid: (pending: PatientPendingOrder) => void;
  submitProductRequest: (product: BrowseProduct, reason: string) => void;
  updateProfile: (patch: Partial<Pick<PatientProfile, "name" | "email" | "phone" | "dateOfBirth">>) => void;
  updateAddresses: (addresses: PatientShippingAddress[]) => void;
  updatePaymentMethods: (methods: PatientPaymentMethod[]) => void;
  getHistoryOrder: (id: string) => PatientHistoryOrder | undefined;
};

const PatientPortalContext = createContext<PatientPortalContextValue | null>(null);

export function PatientPortalProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PatientProfile>(DEMO_PATIENT_PROFILE);
  const [pendingOrders, setPendingOrders] = useState(INITIAL_PENDING_ORDERS);
  const [historyOrders, setHistoryOrders] = useState(INITIAL_HISTORY_ORDERS);

  const removePendingOrder = useCallback((id: string) => {
    setPendingOrders((current) => current.filter((order) => order.id !== id));
  }, []);

  const markOrderPaid = useCallback((pending: PatientPendingOrder) => {
    setPendingOrders((current) => current.filter((order) => order.id !== pending.id));
    const history: PatientHistoryOrder = {
      id: `hist-${Date.now()}`,
      orderId: pending.orderId,
      date: new Date().toISOString().slice(0, 10),
      status: "paid",
      total: pending.total,
      lineItems: pending.lineItems.map((item) => ({ ...item })),
      receiptUrl: `#receipt-${pending.orderId}`,
    };
    setHistoryOrders((current) => [history, ...current]);
  }, []);

  const submitProductRequest = useCallback(
    (product: BrowseProduct, reason: string) => {
      addStoredPatientRequest({
        patientId: profile.id,
        productId: product.id,
        productName: product.name,
        description: product.shortDescription,
        category: product.category,
        requestReason: reason,
        price: product.price,
      });
    },
    [profile.id],
  );

  const updateProfile = useCallback(
    (patch: Partial<Pick<PatientProfile, "name" | "email" | "phone" | "dateOfBirth">>) => {
      setProfile((current) => ({ ...current, ...patch }));
    },
    [],
  );

  const updateAddresses = useCallback((addresses: PatientShippingAddress[]) => {
    setProfile((current) => ({ ...current, shippingAddresses: addresses }));
  }, []);

  const updatePaymentMethods = useCallback((methods: PatientPaymentMethod[]) => {
    setProfile((current) => ({ ...current, paymentMethods: methods }));
  }, []);

  const getHistoryOrder = useCallback(
    (id: string) =>
      historyOrders.find((order) => order.id === id || order.orderId === id),
    [historyOrders],
  );

  const value = useMemo(
    () => ({
      profile,
      pendingOrders,
      historyOrders,
      products: BROWSE_PRODUCTS,
      removePendingOrder,
      markOrderPaid,
      submitProductRequest,
      updateProfile,
      updateAddresses,
      updatePaymentMethods,
      getHistoryOrder,
    }),
    [
      profile,
      pendingOrders,
      historyOrders,
      removePendingOrder,
      markOrderPaid,
      submitProductRequest,
      updateProfile,
      updateAddresses,
      updatePaymentMethods,
      getHistoryOrder,
    ],
  );

  return (
    <PatientPortalContext.Provider value={value}>{children}</PatientPortalContext.Provider>
  );
}

export function usePatientPortal() {
  const context = useContext(PatientPortalContext);
  if (!context) {
    throw new Error("usePatientPortal must be used within PatientPortalProvider");
  }
  return context;
}
