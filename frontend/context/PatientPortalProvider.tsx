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
import {
  fetchAllPatientHistoryOrders,
  getPatientOrder,
  listPatientPendingOrders,
  listPatientStoreProducts,
  placePatientOrder,
} from "@/lib/patient-portal/api";
import { getPatientSettings, mapSettingsToProfile } from "@/lib/patient/api";
import { mapPatientStoreProduct } from "@/lib/patient-portal/map-store-product";
import { addStoredPatientRequest } from "@/lib/patient-portal/request-store";
import type {
  BrowseProduct,
  PatientHistoryOrder,
  PatientPendingOrder,
  PatientProfile,
  PatientShippingAddress,
  PatientPaymentMethod,
  PlacePatientOrderPayload,
} from "@/lib/patient-portal/types";
import { showError } from "@/lib/toast";

type PatientPortalContextValue = {
  profile: PatientProfile;
  pendingOrders: PatientPendingOrder[];
  historyOrders: PatientHistoryOrder[];
  products: BrowseProduct[];
  productsLoading: boolean;
  productsError: string | null;
  clinicName: string | null;
  ordersLoading: boolean;
  refreshOrders: () => Promise<void>;
  placeOrder: (payload: PlacePatientOrderPayload) => Promise<PatientPendingOrder>;
  fetchOrderDetail: (orderId: string) => Promise<PatientHistoryOrder>;
  submitProductRequest: (product: BrowseProduct, reason: string) => void;
  updateProfile: (patch: Partial<Pick<PatientProfile, "name" | "email" | "phone" | "dateOfBirth">>) => void;
  updateAddresses: (addresses: PatientShippingAddress[]) => void;
  updatePaymentMethods: (methods: PatientPaymentMethod[]) => void;
  getHistoryOrder: (id: string) => PatientHistoryOrder | undefined;
};

const PatientPortalContext = createContext<PatientPortalContextValue | null>(null);

export function PatientPortalProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PatientProfile>({
    id: "",
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    shippingAddresses: [],
    paymentMethods: [],
    subscriptions: [],
  });
  const [pendingOrders, setPendingOrders] = useState<PatientPendingOrder[]>([]);
  const [historyOrders, setHistoryOrders] = useState<PatientHistoryOrder[]>([]);
  const [products, setProducts] = useState<BrowseProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [clinicName, setClinicName] = useState<string | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const refreshOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const doctorName = clinicName ?? "Your physician";
      const [pending, history] = await Promise.all([
        listPatientPendingOrders(doctorName),
        fetchAllPatientHistoryOrders(),
      ]);
      setPendingOrders(pending);
      setHistoryOrders(history);
    } catch (error) {
      showError(error, "Unable to load orders.");
      setPendingOrders([]);
      setHistoryOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [clinicName]);

  useEffect(() => {
    let cancelled = false;

    async function loadPortalData() {
      setProductsLoading(true);
      setProductsError(null);
      setOrdersLoading(true);
      try {
        const settingsRes = await getPatientSettings();
        if (cancelled) return;

        const doctorName = settingsRes.settings.clinic.name ?? "Your physician";
        setProfile(mapSettingsToProfile(settingsRes.settings));
        setClinicName(settingsRes.settings.clinic.name);

        const [pending, history, storeRes] = await Promise.all([
          listPatientPendingOrders(doctorName),
          fetchAllPatientHistoryOrders(),
          listPatientStoreProducts({ page: 1, limit: 500 }),
        ]);
        if (cancelled) return;

        setPendingOrders(pending);
        setHistoryOrders(history);
        setProducts(storeRes.products.map(mapPatientStoreProduct));
      } catch (error) {
        if (cancelled) return;
        setProducts([]);
        setProductsError(error instanceof Error ? error.message : "Failed to load patient portal.");
      } finally {
        if (!cancelled) {
          setProductsLoading(false);
          setOrdersLoading(false);
        }
      }
    }

    void loadPortalData();
    return () => {
      cancelled = true;
    };
  }, []);

  const placeOrder = useCallback(
    async (payload: PlacePatientOrderPayload) => {
      const response = await placePatientOrder(payload);
      const pending: PatientPendingOrder = {
        ...response.pending,
        doctorName: clinicName ?? response.pending.doctorName,
      };
      setPendingOrders((current) => [pending, ...current]);
      return pending;
    },
    [clinicName],
  );

  const fetchOrderDetail = useCallback(async (orderId: string) => {
    const order = await getPatientOrder(orderId);
    setHistoryOrders((current) => {
      const exists = current.some((entry) => entry.id === order.id);
      if (exists) {
        return current.map((entry) => (entry.id === order.id ? order : entry));
      }
      return [order, ...current];
    });
    setPendingOrders((current) => current.filter((entry) => entry.id !== order.id));
    return order;
  }, []);

  const submitProductRequest = useCallback(
    (product: BrowseProduct, reason: string) => {
      addStoredPatientRequest({
        patientId: profile.id,
        productId: product.productId,
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
      historyOrders.find((order) => order.id === id || order.orderId === id) ??
      pendingOrders.find((order) => order.id === id || order.orderId === id),
    [historyOrders, pendingOrders],
  );

  const value = useMemo(
    () => ({
      profile,
      pendingOrders,
      historyOrders,
      products,
      productsLoading,
      productsError,
      clinicName,
      ordersLoading,
      refreshOrders,
      placeOrder,
      fetchOrderDetail,
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
      products,
      productsLoading,
      productsError,
      clinicName,
      ordersLoading,
      refreshOrders,
      placeOrder,
      fetchOrderDetail,
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
