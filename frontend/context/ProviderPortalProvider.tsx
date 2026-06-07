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
  addToMyStore,
  listMyStore,
  removeAllFromStore,
  removeFromStore,
  updateStoreProductPrice,
} from "@/lib/products/api";
import type { StoreProduct } from "@/lib/products/catalog-types";
import { getProviderMetrics } from "@/lib/provider/mock-metrics";
import {
  DEFAULT_STOREFRONT_BRANDING,
  type MetricsDateRange,
  type ProviderMetrics,
  type StorefrontBranding,
} from "@/lib/provider/types";
import { showError } from "@/lib/toast";

type AddStoreItem = { productId: string; retailPrice: number; variantId?: string };

type ProviderPortalContextValue = {
  metricsRange: MetricsDateRange;
  setMetricsRange: (range: MetricsDateRange) => void;
  metrics: ProviderMetrics;
  myStore: StoreProduct[];
  isStoreLoading: boolean;
  refreshMyStore: () => Promise<void>;
  isInMyStore: (productId: string) => boolean;
  getStoreIdForProduct: (productId: string) => string | null;
  addToMyStore: (items: AddStoreItem[]) => Promise<void>;
  removeFromMyStore: (storeId: string) => Promise<void>;
  removeFromMyStoreByProductId: (productId: string) => Promise<void>;
  removeAllFromMyStore: () => Promise<void>;
  updateRetailPrice: (storeId: string, retailPrice: number) => Promise<void>;
  setStoreVisibility: (storeId: string, isVisible: boolean) => Promise<void>;
  branding: StorefrontBranding;
  updateBranding: (patch: Partial<StorefrontBranding>) => void;
};

const ProviderPortalContext = createContext<ProviderPortalContextValue | null>(null);

export function ProviderPortalProvider({ children }: { children: ReactNode }) {
  const [metricsRange, setMetricsRange] = useState<MetricsDateRange>("30d");
  const [myStore, setMyStore] = useState<StoreProduct[]>([]);
  const [isStoreLoading, setIsStoreLoading] = useState(true);
  const [branding, setBranding] = useState<StorefrontBranding>(DEFAULT_STOREFRONT_BRANDING);

  const metrics = useMemo(() => getProviderMetrics(metricsRange), [metricsRange]);

  const refreshMyStore = useCallback(async () => {
    setIsStoreLoading(true);
    try {
      const response = await listMyStore({ page: 1, limit: 100 });
      setMyStore(response.products);
      setBranding((current) => ({
        ...current,
        clinicName: response.clinic_name || current.clinicName,
      }));
    } catch (error) {
      showError(error, "Unable to load My Store.");
      setMyStore([]);
    } finally {
      setIsStoreLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMyStore();
  }, [refreshMyStore]);

  const isInMyStore = useCallback(
    (productId: string) => myStore.some((entry) => entry.product_id === productId),
    [myStore],
  );

  const getStoreIdForProduct = useCallback(
    (productId: string) =>
      myStore.find((entry) => entry.product_id === productId)?.store_id ?? null,
    [myStore],
  );

  const addToMyStoreItems = useCallback(
    async (items: AddStoreItem[]) => {
      for (const item of items) {
        await addToMyStore(item.productId, item.retailPrice, item.variantId);
      }
      await refreshMyStore();
    },
    [refreshMyStore],
  );

  const removeFromMyStoreItem = useCallback(
    async (storeId: string) => {
      await removeFromStore(storeId);
      await refreshMyStore();
    },
    [refreshMyStore],
  );

  const removeFromMyStoreByProductId = useCallback(
    async (productId: string) => {
      const storeId = myStore.find((entry) => entry.product_id === productId)?.store_id;
      if (!storeId) {
        throw new Error("Product is not in My Store.");
      }
      await removeFromStore(storeId);
      await refreshMyStore();
    },
    [myStore, refreshMyStore],
  );

  const removeAllFromMyStoreItems = useCallback(async () => {
    await removeAllFromStore();
    await refreshMyStore();
  }, [refreshMyStore]);

  const updateRetailPriceItem = useCallback(
    async (storeId: string, retailPrice: number) => {
      await updateStoreProductPrice(storeId, retailPrice);
      await refreshMyStore();
    },
    [refreshMyStore],
  );

  const setStoreVisibility = useCallback(
    async (storeId: string, isVisible: boolean) => {
      const entry = myStore.find((item) => item.store_id === storeId);
      if (!entry) {
        throw new Error("Store product not found.");
      }
      await updateStoreProductPrice(storeId, entry.retail_price, isVisible);
      await refreshMyStore();
    },
    [myStore, refreshMyStore],
  );

  const updateBranding = useCallback((patch: Partial<StorefrontBranding>) => {
    setBranding((current) => ({ ...current, ...patch }));
  }, []);

  const value = useMemo(
    () => ({
      metricsRange,
      setMetricsRange,
      metrics,
      myStore,
      isStoreLoading,
      refreshMyStore,
      isInMyStore,
      getStoreIdForProduct,
      addToMyStore: addToMyStoreItems,
      removeFromMyStore: removeFromMyStoreItem,
      removeFromMyStoreByProductId,
      removeAllFromMyStore: removeAllFromMyStoreItems,
      updateRetailPrice: updateRetailPriceItem,
      setStoreVisibility,
      branding,
      updateBranding,
    }),
    [
      metricsRange,
      metrics,
      myStore,
      isStoreLoading,
      refreshMyStore,
      isInMyStore,
      getStoreIdForProduct,
      addToMyStoreItems,
      removeFromMyStoreItem,
      removeFromMyStoreByProductId,
      removeAllFromMyStoreItems,
      updateRetailPriceItem,
      setStoreVisibility,
      branding,
      updateBranding,
    ],
  );

  return (
    <ProviderPortalContext.Provider value={value}>{children}</ProviderPortalContext.Provider>
  );
}

export function useProviderPortal() {
  const context = useContext(ProviderPortalContext);
  if (!context) {
    throw new Error("useProviderPortal must be used within ProviderPortalProvider.");
  }
  return context;
}
