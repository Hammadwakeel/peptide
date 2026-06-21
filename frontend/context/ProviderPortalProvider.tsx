"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { useShallow } from "@/lib/hooks/zustand";
import { computeProviderDashboardStats } from "@/lib/provider/dashboard-stats";
import { useOrdersStore } from "@/stores/orders-store";
import { usePatientsStore } from "@/stores/patients-store";
import { useProviderPortalStore } from "@/stores/provider-portal-store";

export function ProviderPortalProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;

    const unsubscribeSearch = useProviderPortalStore.subscribe((state, prev) => {
      if (state.catalogSearch === prev.catalogSearch) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        useProviderPortalStore
          .getState()
          .setDebouncedCatalogSearch(useProviderPortalStore.getState().catalogSearch);
      }, 300);
    });

    const unsubscribeCatalog = useProviderPortalStore.subscribe((state, prev) => {
      if (
        state.catalogTab !== prev.catalogTab ||
        state.debouncedCatalogSearch !== prev.debouncedCatalogSearch
      ) {
        void useProviderPortalStore.getState().loadCatalog();
      }
    });

    const unsubscribeStore = useProviderPortalStore.subscribe((state, prev) => {
      if (state.myStore.length !== prev.myStore.length) {
        void useProviderPortalStore.getState().loadFullCatalog({ force: true });
      }
    });

    return () => {
      unsubscribeSearch();
      unsubscribeCatalog();
      unsubscribeStore();
      clearTimeout(debounceTimer);
    };
  }, []);

  return children;
}

export function useProviderPortal() {
  const metricsRange = useProviderPortalStore((state) => state.metricsRange);
  const ordersRevision = useOrdersStore((state) => state.orders);
  const metrics = useMemo(
    () => useProviderPortalStore.getState().getMetrics(),
    [metricsRange, ordersRevision],
  );

  const portal = useProviderPortalStore(
    useShallow((state) => ({
      setMetricsRange: state.setMetricsRange,
      myStore: state.myStore,
      isStoreLoading: state.isStoreLoading,
      refreshMyStore: state.refreshMyStore,
      catalogProducts: state.catalogProducts,
      fullCatalogProducts: state.fullCatalogProducts,
      isCatalogLoading: state.isCatalogLoading,
      catalogTab: state.catalogTab,
      setCatalogTab: state.setCatalogTab,
      catalogSearch: state.catalogSearch,
      setCatalogSearch: state.setCatalogSearch,
      loadCatalog: state.loadCatalog,
      getCachedProduct: state.getCachedProduct,
      resolveProduct: state.resolveProduct,
      isInMyStore: state.isInMyStore,
      getStoreIdForProduct: state.getStoreIdForProduct,
      getStoreProduct: state.getStoreProduct,
      addToMyStore: state.addToMyStore,
      removeFromMyStore: state.removeFromMyStore,
      removeFromMyStoreByProductId: state.removeFromMyStoreByProductId,
      removeAllFromMyStore: state.removeAllFromMyStore,
      updateRetailPrice: state.updateRetailPrice,
      setStoreVisibility: state.setStoreVisibility,
      branding: state.branding,
      updateBranding: state.updateBranding,
      clinicProfile: state.clinicProfile,
      providerDisplayName: state.providerDisplayName,
      isProfileHydrated: state.isProfileHydrated,
      isProfileLoading: state.isProfileLoading,
      refreshClinicProfile: state.refreshClinicProfile,
      isStoreHydrated: state.isStoreHydrated,
    })),
  );

  return { metricsRange, metrics, ...portal };
}

export function useProviderDashboard() {
  const ordersSlice = useOrdersStore(
    useShallow((state) => ({
      orders: state.orders,
      isOrdersHydrated: state.isHydrated,
      isOrdersLoading: state.isLoading,
    })),
  );
  const patientsSlice = usePatientsStore(
    useShallow((state) => ({
      patients: state.patients,
      isPatientsHydrated: state.isHydrated,
      isPatientsLoading: state.isLoading,
    })),
  );
  const portalSlice = useProviderPortalStore(
    useShallow((state) => ({
      branding: state.branding,
      providerDisplayName: state.providerDisplayName,
      myStore: state.myStore,
      isStoreHydrated: state.isStoreHydrated,
      isStoreLoading: state.isStoreLoading,
      isProfileHydrated: state.isProfileHydrated,
      isProfileLoading: state.isProfileLoading,
    })),
  );

  const stats = useMemo(
    () =>
      computeProviderDashboardStats(
        ordersSlice.orders,
        patientsSlice.patients.length,
        portalSlice.myStore,
      ),
    [ordersSlice.orders, patientsSlice.patients.length, portalSlice.myStore],
  );

  const cardsReady =
    ordersSlice.isOrdersHydrated &&
    patientsSlice.isPatientsHydrated &&
    portalSlice.isStoreHydrated &&
    portalSlice.isProfileHydrated;

  const isAnyLoading =
    ordersSlice.isOrdersLoading ||
    patientsSlice.isPatientsLoading ||
    portalSlice.isStoreLoading ||
    portalSlice.isProfileLoading;

  return {
    ...portalSlice,
    orders: ordersSlice.orders,
    isOrdersHydrated: ordersSlice.isOrdersHydrated,
    isOrdersLoading: ordersSlice.isOrdersLoading,
    patients: patientsSlice.patients,
    isPatientsHydrated: patientsSlice.isPatientsHydrated,
    isPatientsLoading: patientsSlice.isPatientsLoading,
    stats,
    cardsReady,
    isAnyLoading,
  };
}
