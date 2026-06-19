"use client";

import { create } from "zustand";
import {
  fetchAllPatientHistoryOrders,
  fetchRemainingPatientStoreProducts,
  getPatientOrder,
  listPatientPendingOrders,
  listPatientStoreProducts,
  placePatientOrder,
} from "@/lib/patient-portal/api";
import { getPatientSettings, mapSettingsToProfile } from "@/lib/patient/api";
import { mapPatientStoreProduct } from "@/lib/patient-portal/map-store-product";
import { usePatientRequestsStore } from "@/stores/patient-requests-store";
import type {
  BrowseProduct,
  PatientHistoryOrder,
  PatientPendingOrder,
  PatientProfile,
  PatientShippingAddress,
  PatientPaymentMethod,
  PlacePatientOrderPayload,
} from "@/lib/patient-portal/types";
import { patchIfChanged } from "@/lib/cache/set-if-changed";
import { showError } from "@/lib/toast";

type PatientPortalState = {
  profile: PatientProfile;
  pendingOrders: PatientPendingOrder[];
  historyOrders: PatientHistoryOrder[];
  products: BrowseProduct[];
  productsLoading: boolean;
  productsError: string | null;
  clinicName: string | null;
  ordersLoading: boolean;
  isHydrated: boolean;
  loadInFlight: Promise<void> | null;
  loadPortalData: (options?: { force?: boolean }) => Promise<void>;
  refreshOrders: () => Promise<void>;
  reset: () => void;
  placeOrder: (payload: PlacePatientOrderPayload) => Promise<PatientPendingOrder>;
  fetchOrderDetail: (orderId: string) => Promise<PatientHistoryOrder>;
  submitProductRequest: (product: BrowseProduct, reason: string) => void;
  updateProfile: (patch: Partial<Pick<PatientProfile, "name" | "email" | "phone" | "dateOfBirth">>) => void;
  updateAddresses: (addresses: PatientShippingAddress[]) => void;
  updatePaymentMethods: (methods: PatientPaymentMethod[]) => void;
  getHistoryOrder: (id: string) => PatientHistoryOrder | PatientPendingOrder | undefined;
};

const emptyProfile: PatientProfile = {
  id: "",
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  shippingAddresses: [],
  paymentMethods: [],
  subscriptions: [],
};

export const usePatientPortalStore = create<PatientPortalState>((set, get) => ({
  profile: emptyProfile,
  pendingOrders: [],
  historyOrders: [],
  products: [],
  productsLoading: true,
  productsError: null,
  clinicName: null,
  ordersLoading: true,
  isHydrated: false,
  loadInFlight: null,

  reset: () =>
    set({
      profile: emptyProfile,
      pendingOrders: [],
      historyOrders: [],
      products: [],
      productsLoading: true,
      productsError: null,
      clinicName: null,
      ordersLoading: true,
      isHydrated: false,
      loadInFlight: null,
    }),

  loadPortalData: async (options = {}) => {
    const { force = false } = options;
    if (!force && get().isHydrated) return;
    if (get().loadInFlight) return get().loadInFlight!;

    const promise = (async () => {
      if (!get().isHydrated) {
        set({ productsLoading: true, productsError: null, ordersLoading: true });
      }
      try {
        const settingsRes = await getPatientSettings();
        const doctorName = settingsRes.settings.clinic.name ?? "Your physician";
        const profile = mapSettingsToProfile(settingsRes.settings);
        const clinicName = settingsRes.settings.clinic.name;

        const [pending, history, storeRes] = await Promise.all([
          listPatientPendingOrders(doctorName),
          fetchAllPatientHistoryOrders(),
          listPatientStoreProducts({ page: 1, limit: 50 }),
        ]);

        const products = storeRes.products.map(mapPatientStoreProduct);
        set((state) => ({
          profile: patchIfChanged(state.profile, profile),
          clinicName,
          pendingOrders: patchIfChanged(state.pendingOrders, pending),
          historyOrders: patchIfChanged(state.historyOrders, history),
          products: patchIfChanged(state.products, products),
          productsError: null,
          isHydrated: true,
        }));

        if (storeRes.pagination.has_next) {
          void fetchRemainingPatientStoreProducts(2).then((remaining) => {
            if (remaining.length === 0) return;
            set((state) => ({
              products: patchIfChanged(
                state.products,
                [...state.products, ...remaining.map(mapPatientStoreProduct)],
              ),
            }));
          });
        }
      } catch (error) {
        set({
          products: [],
          productsError: error instanceof Error ? error.message : "Failed to load patient portal.",
        });
      } finally {
        set({ productsLoading: false, ordersLoading: false, loadInFlight: null });
      }
    })();

    set({ loadInFlight: promise });
    return promise;
  },

  refreshOrders: async () => {
    const clinicName = get().clinicName;
    set({ ordersLoading: true });
    try {
      const doctorName = clinicName ?? "Your physician";
      const [pending, history] = await Promise.all([
        listPatientPendingOrders(doctorName, { fetchAll: true }),
        fetchAllPatientHistoryOrders({ fetchAll: true }),
      ]);
      set((state) => ({
        pendingOrders: patchIfChanged(state.pendingOrders, pending),
        historyOrders: patchIfChanged(state.historyOrders, history),
      }));
    } catch (error) {
      showError(error, "Unable to load orders.");
      set({ pendingOrders: [], historyOrders: [] });
    } finally {
      set({ ordersLoading: false });
    }
  },

  placeOrder: async (payload) => {
    const response = await placePatientOrder(payload);
    const clinicName = get().clinicName;
    const pending: PatientPendingOrder = {
      ...response.pending,
      doctorName: clinicName ?? response.pending.doctorName,
    };
    set((state) => ({ pendingOrders: [pending, ...state.pendingOrders] }));
    return pending;
  },

  fetchOrderDetail: async (orderId) => {
    const order = await getPatientOrder(orderId);
    set((state) => {
      const exists = state.historyOrders.some((entry) => entry.id === order.id);
      const historyOrders = exists
        ? state.historyOrders.map((entry) => (entry.id === order.id ? order : entry))
        : [order, ...state.historyOrders];
      const pendingOrders = state.pendingOrders.filter((entry) => entry.id !== order.id);
      return { historyOrders, pendingOrders };
    });
    return order;
  },

  submitProductRequest: (product, reason) => {
    const profileId = get().profile.id;
    usePatientRequestsStore.getState().addRequest({
      patientId: profileId,
      productId: product.productId,
      productName: product.name,
      description: product.shortDescription,
      category: product.category,
      requestReason: reason,
      price: product.price,
    });
  },

  updateProfile: (patch) => {
    set((state) => ({ profile: { ...state.profile, ...patch } }));
  },

  updateAddresses: (addresses) => {
    set((state) => ({ profile: { ...state.profile, shippingAddresses: addresses } }));
  },

  updatePaymentMethods: (methods) => {
    set((state) => ({ profile: { ...state.profile, paymentMethods: methods } }));
  },

  getHistoryOrder: (id) => {
    const { historyOrders, pendingOrders } = get();
    return (
      historyOrders.find((order) => order.id === id || order.orderId === id) ??
      pendingOrders.find((order) => order.id === id || order.orderId === id)
    );
  },
}));
