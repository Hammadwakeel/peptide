"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MOCK_PRODUCTS } from "@/lib/products/mock-data";
import { getProviderMetrics } from "@/lib/provider/mock-metrics";
import {
  DEFAULT_STOREFRONT_BRANDING,
  type MetricsDateRange,
  type MyStoreEntry,
  type ProviderMetrics,
  type StorefrontBranding,
} from "@/lib/provider/types";

function defaultRetailPrice(productId: string): number {
  const product = MOCK_PRODUCTS.find((item) => item.id === productId);
  if (!product) return 0;
  return Math.ceil(product.clinicPrice * 1.35);
}

const INITIAL_STORE: MyStoreEntry[] = [
  { productId: "prod-002", retailPrice: 249 },
];

type ProviderPortalContextValue = {
  metricsRange: MetricsDateRange;
  setMetricsRange: (range: MetricsDateRange) => void;
  metrics: ProviderMetrics;
  myStore: MyStoreEntry[];
  isInMyStore: (productId: string) => boolean;
  addToMyStore: (productIds: string[]) => void;
  removeFromMyStore: (productId: string) => void;
  removeAllFromMyStore: () => void;
  updateRetailPrice: (productId: string, retailPrice: number) => void;
  branding: StorefrontBranding;
  updateBranding: (patch: Partial<StorefrontBranding>) => void;
};

const ProviderPortalContext = createContext<ProviderPortalContextValue | null>(null);

export function ProviderPortalProvider({ children }: { children: ReactNode }) {
  const [metricsRange, setMetricsRange] = useState<MetricsDateRange>("30d");
  const [myStore, setMyStore] = useState<MyStoreEntry[]>(INITIAL_STORE);
  const [branding, setBranding] = useState<StorefrontBranding>(DEFAULT_STOREFRONT_BRANDING);

  const metrics = useMemo(() => getProviderMetrics(metricsRange), [metricsRange]);

  const isInMyStore = useCallback(
    (productId: string) => myStore.some((entry) => entry.productId === productId),
    [myStore],
  );

  const addToMyStore = useCallback((productIds: string[]) => {
    setMyStore((current) => {
      const existing = new Set(current.map((entry) => entry.productId));
      const additions = productIds
        .filter((id) => !existing.has(id))
        .map((productId) => ({
          productId,
          retailPrice: defaultRetailPrice(productId),
        }));
      return [...current, ...additions];
    });
  }, []);

  const removeFromMyStore = useCallback((productId: string) => {
    setMyStore((current) => current.filter((entry) => entry.productId !== productId));
  }, []);

  const removeAllFromMyStore = useCallback(() => {
    setMyStore([]);
  }, []);

  const updateRetailPrice = useCallback((productId: string, retailPrice: number) => {
    setMyStore((current) =>
      current.map((entry) =>
        entry.productId === productId ? { ...entry, retailPrice } : entry,
      ),
    );
  }, []);

  const updateBranding = useCallback((patch: Partial<StorefrontBranding>) => {
    setBranding((current) => ({ ...current, ...patch }));
  }, []);

  const value = useMemo(
    () => ({
      metricsRange,
      setMetricsRange,
      metrics,
      myStore,
      isInMyStore,
      addToMyStore,
      removeFromMyStore,
      removeAllFromMyStore,
      updateRetailPrice,
      branding,
      updateBranding,
    }),
    [
      metricsRange,
      metrics,
      myStore,
      isInMyStore,
      addToMyStore,
      removeFromMyStore,
      removeAllFromMyStore,
      updateRetailPrice,
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
    throw new Error("useProviderPortal must be used within ProviderPortalProvider");
  }
  return context;
}
