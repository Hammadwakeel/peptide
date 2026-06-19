"use client";

import { create } from "zustand";
import {
  getPlatformSettings,
  listAffiliates,
  listApplications,
  listClinics,
  listPatientsByClinicBulk,
} from "@/lib/admin/api";
import { listCategories, listProducts } from "@/lib/admin/inventory/api";
import type { InventoryCategory, InventoryProduct } from "@/lib/admin/inventory/types";
import { patchIfChanged } from "@/lib/cache/set-if-changed";
import type {
  AdminAffiliate,
  AdminApplication,
  AdminClinic,
  AdminClinicPatient,
  PlatformSettings,
} from "@/lib/admin/types";
import type { InventoryAlert } from "@/lib/wms/types";
import { showError } from "@/lib/toast";

export type PatientsByClinicId = Record<string, AdminClinicPatient[]>;

async function fetchUserManagementData() {
  const [clinicsResponse, patientsResponse] = await Promise.all([
    listClinics({ page: 1, limit: 100 }),
    listPatientsByClinicBulk(100),
  ]);

  return {
    clinics: clinicsResponse.clinics,
    patientsByClinicId: patientsResponse.patients_by_clinic as PatientsByClinicId,
  };
}

function mapProductToAlert(product: InventoryProduct): InventoryAlert {
  return {
    id: product.id,
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    currentStock: product.stock_count,
    threshold: product.low_stock_threshold,
    level: product.stock_status === "out_of_stock" ? "out_of_stock" : "low_stock",
  };
}

type AdminPortalState = {
  clinics: AdminClinic[];
  patientsByClinicId: PatientsByClinicId;
  applications: AdminApplication[];
  affiliates: AdminAffiliate[];
  categories: InventoryCategory[];
  catalogProducts: InventoryProduct[];
  inventoryAlerts: InventoryAlert[];
  platformSettings: PlatformSettings | null;
  isHydrated: boolean;
  isLoading: boolean;
  bootstrapInFlight: Promise<void> | null;
  bootstrap: (force?: boolean) => Promise<void>;
  refreshUserManagement: (force?: boolean) => Promise<void>;
  refreshApplications: (force?: boolean) => Promise<void>;
  refreshAffiliates: (force?: boolean) => Promise<void>;
  refreshCatalog: (force?: boolean) => Promise<void>;
  refreshInventoryAlerts: (force?: boolean) => Promise<void>;
  refreshPlatformSettings: () => Promise<void>;
  setPlatformSettings: (settings: PlatformSettings) => void;
  setApplications: (applications: AdminApplication[]) => void;
  setAffiliates: (affiliates: AdminAffiliate[]) => void;
  setCatalogProducts: (products: InventoryProduct[]) => void;
  setUserManagement: (data: { clinics: AdminClinic[]; patientsByClinicId: PatientsByClinicId }) => void;
  updateClinicPatients: (
    clinicId: string,
    updater: (patients: AdminClinicPatient[]) => AdminClinicPatient[],
  ) => void;
  reset: () => void;
};

const initialState = {
  clinics: [] as AdminClinic[],
  patientsByClinicId: {} as PatientsByClinicId,
  applications: [] as AdminApplication[],
  affiliates: [] as AdminAffiliate[],
  categories: [] as InventoryCategory[],
  catalogProducts: [] as InventoryProduct[],
  inventoryAlerts: [] as InventoryAlert[],
  platformSettings: null as PlatformSettings | null,
  isHydrated: false,
  isLoading: false,
  bootstrapInFlight: null as Promise<void> | null,
};

export const useAdminPortalStore = create<AdminPortalState>((set, get) => ({
  ...initialState,

  setApplications: (applications) =>
    set((state) => ({ applications: patchIfChanged(state.applications, applications) })),

  setAffiliates: (affiliates) =>
    set((state) => ({ affiliates: patchIfChanged(state.affiliates, affiliates) })),

  setCatalogProducts: (products) =>
    set((state) => ({ catalogProducts: patchIfChanged(state.catalogProducts, products) })),

  setUserManagement: ({ clinics, patientsByClinicId }) =>
    set((state) => ({
      clinics: patchIfChanged(state.clinics, clinics),
      patientsByClinicId: patchIfChanged(state.patientsByClinicId, patientsByClinicId),
    })),

  updateClinicPatients: (clinicId, updater) => {
    set((state) => {
      const existing = state.patientsByClinicId[clinicId] ?? [];
      const nextPatients = updater(existing);
      if (nextPatients === existing) return state;
      return {
        patientsByClinicId: {
          ...state.patientsByClinicId,
          [clinicId]: nextPatients,
        },
      };
    });
  },

  refreshUserManagement: async (force = false) => {
    try {
      const data = await fetchUserManagementData();
      get().setUserManagement(data);
    } catch (error) {
      showError(error, "Unable to load user management data.");
      if (force) {
        set({ clinics: [], patientsByClinicId: {} });
      }
    }
  },

  refreshApplications: async (force = false) => {
    try {
      const response = await listApplications({ page: 1, limit: 50 });
      get().setApplications(response.applications);
    } catch (error) {
      showError(error, "Unable to load applications.");
      if (force) set({ applications: [] });
    }
  },

  refreshAffiliates: async (force = false) => {
    try {
      const response = await listAffiliates({ page: 1, limit: 100 });
      get().setAffiliates(response.affiliates);
    } catch (error) {
      showError(error, "Unable to load affiliates.");
      if (force) set({ affiliates: [] });
    }
  },

  refreshCatalog: async (force = false) => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        listProducts({ page: 1, limit: 100 }),
        listCategories(),
      ]);
      set((state) => ({
        catalogProducts: patchIfChanged(state.catalogProducts, productsResponse.products),
        categories: patchIfChanged(state.categories, categoriesResponse.categories),
      }));
    } catch (error) {
      showError(error, "Unable to load catalog.");
      if (force) set({ catalogProducts: [], categories: [] });
    }
  },

  refreshInventoryAlerts: async () => {
    try {
      const [lowStock, outOfStock] = await Promise.all([
        listProducts({ stock_status: "low", limit: 100 }),
        listProducts({ stock_status: "out_of_stock", limit: 100 }),
      ]);
      const alerts = [
        ...outOfStock.products.map(mapProductToAlert),
        ...lowStock.products.map(mapProductToAlert),
      ];
      set((state) => ({ inventoryAlerts: patchIfChanged(state.inventoryAlerts, alerts) }));
    } catch {
      set({ inventoryAlerts: [] });
    }
  },

  setPlatformSettings: (settings) =>
    set((state) => ({
      platformSettings: patchIfChanged(state.platformSettings, settings),
    })),

  refreshPlatformSettings: async () => {
    try {
      const response = await getPlatformSettings();
      get().setPlatformSettings(response.settings);
    } catch (error) {
      showError(error, "Unable to load platform settings.");
    }
  },

  bootstrap: async (force = false) => {
    if (!force && get().isHydrated) return;
    if (!force && get().bootstrapInFlight) return get().bootstrapInFlight!;

    const promise = (async () => {
      if (!get().isHydrated) set({ isLoading: true });
      await Promise.all([
        get().refreshUserManagement(force),
        get().refreshApplications(force),
        get().refreshAffiliates(force),
        get().refreshCatalog(force),
        get().refreshInventoryAlerts(),
        get().refreshPlatformSettings(),
      ]);
      set({ isHydrated: true, isLoading: false, bootstrapInFlight: null });
    })();

    set({ bootstrapInFlight: promise });
    return promise;
  },

  reset: () => set({ ...initialState }),
}));
