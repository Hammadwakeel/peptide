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
  batchAddToMyStore,
  fetchAllCatalog,
  fetchAllMyStore,
  getCatalogProduct,
  removeAllFromStore,
  removeFromStore,
  updateStoreProductPrice,
  updateStoreProductVisibility,
} from "@/lib/products/api";
import type { CatalogProduct, CatalogProductType, StoreProduct } from "@/lib/products/catalog-types";
import { getPrimaryImage } from "@/lib/products/catalog-types";
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
  catalogProducts: CatalogProduct[];
  fullCatalogProducts: CatalogProduct[];
  isCatalogLoading: boolean;
  catalogTab: CatalogProductType;
  setCatalogTab: (tab: CatalogProductType) => void;
  catalogSearch: string;
  setCatalogSearch: (search: string) => void;
  loadCatalog: (force?: boolean) => Promise<CatalogProduct[]>;
  getCachedProduct: (idOrSlug: string) => CatalogProduct | undefined;
  resolveProduct: (idOrSlug: string) => Promise<CatalogProduct>;
  isInMyStore: (productId: string) => boolean;
  getStoreIdForProduct: (productId: string) => string | null;
  getStoreProduct: (productId: string) => StoreProduct | undefined;
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

function buildStoreProductFromCatalog(
  catalog: CatalogProduct,
  storeItem: { store_id: string; product_id: string; retail_price: number },
): StoreProduct {
  return {
    store_id: storeItem.store_id,
    product_id: storeItem.product_id,
    name: catalog.name,
    sku: catalog.sku,
    slug: catalog.slug,
    product_type: catalog.product_type,
    description: catalog.description,
    category: catalog.category,
    stock_status: catalog.stock_status,
    stock_count: catalog.stock_count,
    clinic_cost: catalog.clinic_cost,
    retail_price: storeItem.retail_price,
    image_url: getPrimaryImage(catalog),
    is_visible: true,
    strength: catalog.strength,
    form: catalog.form,
    dea_schedule: catalog.dea_schedule,
  };
}

function indexCatalogProducts(products: CatalogProduct[]) {
  const index = new Map<string, CatalogProduct>();
  products.forEach((product) => {
    index.set(product.id, product);
    if (product.slug) index.set(product.slug, product);
  });
  return index;
}

export function ProviderPortalProvider({ children }: { children: ReactNode }) {
  const [metricsRange, setMetricsRange] = useState<MetricsDateRange>("30d");
  const [myStore, setMyStore] = useState<StoreProduct[]>([]);
  const [isStoreLoading, setIsStoreLoading] = useState(true);
  const [branding, setBranding] = useState<StorefrontBranding>(DEFAULT_STOREFRONT_BRANDING);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [fullCatalogProducts, setFullCatalogProducts] = useState<CatalogProduct[]>([]);
  const [productIndex, setProductIndex] = useState<Map<string, CatalogProduct>>(new Map());
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [catalogTab, setCatalogTab] = useState<CatalogProductType>("peptides");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [debouncedCatalogSearch, setDebouncedCatalogSearch] = useState("");
  const [catalogCacheKey, setCatalogCacheKey] = useState("");

  const metrics = useMemo(() => getProviderMetrics(metricsRange), [metricsRange]);

  const storeProductIds = useMemo(
    () => new Set(myStore.map((entry) => entry.product_id)),
    [myStore],
  );

  const refreshMyStore = useCallback(async () => {
    setIsStoreLoading(true);
    try {
      const products = await fetchAllMyStore();
      setMyStore(products);
      setBranding((current) => ({ ...current }));
    } catch (error) {
      showError(error, "Unable to load My Store.");
      setMyStore([]);
    } finally {
      setIsStoreLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedCatalogSearch(catalogSearch);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [catalogSearch]);

  const loadCatalog = useCallback(
    async (force = false) => {
      const cacheKey = `${catalogTab}|${debouncedCatalogSearch.trim().toLowerCase()}`;
      if (!force && cacheKey === catalogCacheKey && catalogProducts.length > 0) {
        return catalogProducts;
      }

      setIsCatalogLoading(true);
      try {
        const products = await fetchAllCatalog({
          product_type: catalogTab,
          search: debouncedCatalogSearch.trim() || undefined,
        });
        const storeIds = new Set(myStore.map((entry) => entry.product_id));
        const enriched = products.map((product) => ({
          ...product,
          in_my_store: product.in_my_store ?? storeIds.has(product.id),
        }));
        setCatalogProducts(enriched);
        setProductIndex(indexCatalogProducts(enriched));
        setCatalogCacheKey(cacheKey);
        return enriched;
      } catch (error) {
        showError(error, "Unable to load catalog.");
        setCatalogProducts([]);
        setProductIndex(new Map());
        return [];
      } finally {
        setIsCatalogLoading(false);
      }
    },
    [catalogTab, debouncedCatalogSearch, catalogCacheKey, catalogProducts, myStore],
  );

  const getCachedProduct = useCallback(
    (idOrSlug: string) => productIndex.get(idOrSlug),
    [productIndex],
  );

  const cacheProduct = useCallback((product: CatalogProduct) => {
    setProductIndex((current) => {
      const next = new Map(current);
      next.set(product.id, product);
      if (product.slug) next.set(product.slug, product);
      return next;
    });
    setCatalogProducts((current) => {
      const exists = current.some((entry) => entry.id === product.id);
      if (exists) {
        return current.map((entry) => (entry.id === product.id ? product : entry));
      }
      return [...current, product];
    });
  }, []);

  const ensureProductCached = useCallback(
    async (idOrSlug: string) => {
      const cached = productIndex.get(idOrSlug);
      if (cached) return cached;
      const response = await getCatalogProduct(idOrSlug);
      const product = { ...response.product, in_my_store: storeProductIds.has(response.product.id) };
      cacheProduct(product);
      return product;
    },
    [productIndex, storeProductIds, cacheProduct],
  );

  const loadFullCatalog = useCallback(async () => {
    try {
      const [peptides, pharmacy] = await Promise.all([
        fetchAllCatalog({ product_type: "peptides" }),
        fetchAllCatalog({ product_type: "pharmacy" }),
      ]);
      const combined = [...peptides, ...pharmacy];
      const storeIds = new Set(myStore.map((entry) => entry.product_id));
      const enriched = combined.map((product) => ({
        ...product,
        in_my_store: product.in_my_store ?? storeIds.has(product.id),
      }));
      setFullCatalogProducts(enriched);
      setProductIndex((current) => {
        const next = new Map(current);
        enriched.forEach((product) => {
          next.set(product.id, product);
          if (product.slug) next.set(product.slug, product);
        });
        return next;
      });
      return enriched;
    } catch (error) {
      showError(error, "Unable to load full catalog.");
      return [];
    }
  }, [myStore]);

  useEffect(() => {
    void refreshMyStore();
  }, [refreshMyStore]);

  useEffect(() => {
    void loadCatalog();
  }, [catalogTab, debouncedCatalogSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (myStore.length >= 0) {
      void loadFullCatalog();
    }
  }, [myStore.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const isInMyStore = useCallback(
    (productId: string) => storeProductIds.has(productId),
    [storeProductIds],
  );

  const getStoreIdForProduct = useCallback(
    (productId: string) =>
      myStore.find((entry) => entry.product_id === productId)?.store_id ?? null,
    [myStore],
  );

  const getStoreProduct = useCallback(
    (productId: string) => myStore.find((entry) => entry.product_id === productId),
    [myStore],
  );

  const markCatalogInStore = useCallback((productId: string, inStore: boolean) => {
    setCatalogProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, in_my_store: inStore } : product,
      ),
    );
    setProductIndex((current) => {
      const next = new Map(current);
      const product = next.get(productId);
      if (product) {
        const updated = { ...product, in_my_store: inStore };
        next.set(productId, updated);
        if (product.slug) next.set(product.slug, updated);
      }
      return next;
    });
  }, []);

  const addToMyStoreItems = useCallback(
    async (items: AddStoreItem[]) => {
      const previousStore = myStore;
      const optimisticEntries = items
        .map((item) => {
          const catalog = productIndex.get(item.productId);
          if (!catalog) return null;
          return buildStoreProductFromCatalog(catalog, {
            store_id: `temp-${item.productId}`,
            product_id: item.productId,
            retail_price: item.retailPrice,
          });
        })
        .filter((entry): entry is StoreProduct => entry !== null);

      setMyStore((current) => {
        const existingIds = new Set(current.map((entry) => entry.product_id));
        const additions = optimisticEntries.filter((entry) => !existingIds.has(entry.product_id));
        return [...current, ...additions];
      });
      items.forEach((item) => markCatalogInStore(item.productId, true));

      try {
        if (items.length === 1) {
          const item = items[0];
          const response = await addToMyStore(item.productId, item.retailPrice, item.variantId);
          setMyStore((current) =>
            current.map((entry) =>
              entry.product_id === item.productId ? response.store_item : entry,
            ),
          );
          return;
        }

        const response = await batchAddToMyStore(
          items.map((item) => ({
            product_id: item.productId,
            retail_price: item.retailPrice,
            variant_id: item.variantId,
          })),
        );

        const additions = response.store_items
          .map((storeItem) => {
            const catalog = productIndex.get(storeItem.product_id);
            if (!catalog) return null;
            return buildStoreProductFromCatalog(catalog, storeItem);
          })
          .filter((entry): entry is StoreProduct => entry !== null);

        setMyStore((current) => {
          const withoutTemps = current.filter((entry) => !entry.store_id.startsWith("temp-"));
          const existingIds = new Set(withoutTemps.map((entry) => entry.product_id));
          const merged = additions.filter((entry) => !existingIds.has(entry.product_id));
          return [...withoutTemps, ...merged];
        });
      } catch (error) {
        setMyStore(previousStore);
        items.forEach((item) => markCatalogInStore(item.productId, false));
        throw error;
      }
    },
    [myStore, productIndex, markCatalogInStore],
  );

  const removeFromMyStoreItem = useCallback(
    async (storeId: string) => {
      const previousStore = myStore;
      const removed = myStore.find((entry) => entry.store_id === storeId);
      setMyStore((current) => current.filter((entry) => entry.store_id !== storeId));
      if (removed) markCatalogInStore(removed.product_id, false);

      try {
        await removeFromStore(storeId);
      } catch (error) {
        setMyStore(previousStore);
        if (removed) markCatalogInStore(removed.product_id, true);
        throw error;
      }
    },
    [myStore, markCatalogInStore],
  );

  const removeFromMyStoreByProductId = useCallback(
    async (productId: string) => {
      const storeId = myStore.find((entry) => entry.product_id === productId)?.store_id;
      if (!storeId || storeId.startsWith("temp-")) {
        throw new Error("Product is not in My Store.");
      }
      await removeFromMyStoreItem(storeId);
    },
    [myStore, removeFromMyStoreItem],
  );

  const removeAllFromMyStoreItems = useCallback(async () => {
    const previousStore = myStore;
    setMyStore([]);
    myStore.forEach((entry) => markCatalogInStore(entry.product_id, false));

    try {
      await removeAllFromStore();
    } catch (error) {
      setMyStore(previousStore);
      previousStore.forEach((entry) => markCatalogInStore(entry.product_id, true));
      throw error;
    }
  }, [myStore, markCatalogInStore]);

  const updateRetailPriceItem = useCallback(
    async (storeId: string, retailPrice: number) => {
      const previousStore = myStore;
      setMyStore((current) =>
        current.map((entry) =>
          entry.store_id === storeId ? { ...entry, retail_price: retailPrice } : entry,
        ),
      );

      try {
        const response = await updateStoreProductPrice(storeId, retailPrice);
        setMyStore((current) =>
          current.map((entry) =>
            entry.store_id === storeId ? response.store_item : entry,
          ),
        );
      } catch (error) {
        setMyStore(previousStore);
        throw error;
      }
    },
    [myStore],
  );

  const setStoreVisibility = useCallback(
    async (storeId: string, isVisible: boolean) => {
      const previousStore = myStore;
      setMyStore((current) =>
        current.map((entry) =>
          entry.store_id === storeId ? { ...entry, is_visible: isVisible } : entry,
        ),
      );

      try {
        const response = await updateStoreProductVisibility(storeId, isVisible);
        setMyStore((current) =>
          current.map((entry) =>
            entry.store_id === storeId ? response.store_item : entry,
          ),
        );
      } catch (error) {
        setMyStore(previousStore);
        throw error;
      }
    },
    [myStore],
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
      catalogProducts,
      fullCatalogProducts,
      isCatalogLoading,
      catalogTab,
      setCatalogTab,
      catalogSearch,
      setCatalogSearch,
      loadCatalog,
      getCachedProduct,
      resolveProduct: ensureProductCached,
      isInMyStore,
      getStoreIdForProduct,
      getStoreProduct,
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
      catalogProducts,
      fullCatalogProducts,
      isCatalogLoading,
      catalogTab,
      catalogSearch,
      loadCatalog,
      getCachedProduct,
      ensureProductCached,
      isInMyStore,
      getStoreIdForProduct,
      getStoreProduct,
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
