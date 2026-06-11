"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { useShallow } from "@/lib/hooks/zustand";
import { useOrdersStore } from "@/stores/orders-store";
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
    })),
  );

  return { metricsRange, metrics, ...portal };
}
