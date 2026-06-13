"use client";

import { create } from "zustand";
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
import { computeProviderMetrics } from "@/lib/provider/compute-metrics";
import { useOrdersStore } from "@/stores/orders-store";
import {
  DEFAULT_STOREFRONT_BRANDING,
  type MetricsDateRange,
  type ProviderMetrics,
  type StorefrontBranding,
} from "@/lib/provider/types";
import { patchIfChanged } from "@/lib/cache/set-if-changed";
import { showError } from "@/lib/toast";

type AddStoreItem = { productId: string; retailPrice: number; variantId?: string };

type ProviderPortalState = {
  metricsRange: MetricsDateRange;
  myStore: StoreProduct[];
  isStoreLoading: boolean;
  isStoreHydrated: boolean;
  isFullCatalogHydrated: boolean;
  storeRefreshInFlight: Promise<void> | null;
  fullCatalogInFlight: Promise<CatalogProduct[]> | null;
  branding: StorefrontBranding;
  catalogProducts: CatalogProduct[];
  fullCatalogProducts: CatalogProduct[];
  productIndex: Map<string, CatalogProduct>;
  isCatalogLoading: boolean;
  catalogTab: CatalogProductType;
  catalogSearch: string;
  debouncedCatalogSearch: string;
  catalogCacheKey: string;
  setMetricsRange: (range: MetricsDateRange) => void;
  setCatalogTab: (tab: CatalogProductType) => void;
  setCatalogSearch: (search: string) => void;
  setDebouncedCatalogSearch: (search: string) => void;
  getMetrics: () => ProviderMetrics;
  refreshMyStore: (options?: { force?: boolean }) => Promise<void>;
  loadCatalog: (force?: boolean) => Promise<CatalogProduct[]>;
  loadFullCatalog: (options?: { force?: boolean }) => Promise<CatalogProduct[]>;
  reset: () => void;
  getCachedProduct: (idOrSlug: string) => CatalogProduct | undefined;
  cacheProduct: (product: CatalogProduct) => void;
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
  updateBranding: (patch: Partial<StorefrontBranding>) => void;
  markCatalogInStore: (productId: string, inStore: boolean) => void;
};

function buildStoreProductFromCatalog(
  catalog: CatalogProduct,
  storeItem: { store_id: string; product_id: string; retail_price: number },
): StoreProduct {
  return {
    store_id: storeItem.store_id,
    product_id: storeItem.product_id,
    name: catalog.name,
    sku: catalog.sku,
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

export const useProviderPortalStore = create<ProviderPortalState>((set, get) => ({
  metricsRange: "30d",
  myStore: [],
  isStoreLoading: true,
  isStoreHydrated: false,
  isFullCatalogHydrated: false,
  storeRefreshInFlight: null,
  fullCatalogInFlight: null,
  branding: DEFAULT_STOREFRONT_BRANDING,
  catalogProducts: [],
  fullCatalogProducts: [],
  productIndex: new Map(),
  isCatalogLoading: false,
  catalogTab: "peptides",
  catalogSearch: "",
  debouncedCatalogSearch: "",
  catalogCacheKey: "",

  setMetricsRange: (metricsRange) => set({ metricsRange }),
  setCatalogTab: (catalogTab) => set({ catalogTab }),
  setCatalogSearch: (catalogSearch) => set({ catalogSearch }),
  setDebouncedCatalogSearch: (debouncedCatalogSearch) => set({ debouncedCatalogSearch }),

  getMetrics: () =>
    computeProviderMetrics(useOrdersStore.getState().orders, get().metricsRange),

  reset: () =>
    set({
      metricsRange: "30d",
      myStore: [],
      isStoreLoading: true,
      isStoreHydrated: false,
      isFullCatalogHydrated: false,
      storeRefreshInFlight: null,
      fullCatalogInFlight: null,
      branding: DEFAULT_STOREFRONT_BRANDING,
      catalogProducts: [],
      fullCatalogProducts: [],
      productIndex: new Map(),
      isCatalogLoading: false,
      catalogTab: "peptides",
      catalogSearch: "",
      debouncedCatalogSearch: "",
      catalogCacheKey: "",
    }),

  refreshMyStore: async (options = {}) => {
    const { force = false } = options;
    if (!force && get().isStoreHydrated) return;
    if (get().storeRefreshInFlight) return get().storeRefreshInFlight!;

    const promise = (async () => {
      if (!get().isStoreHydrated) set({ isStoreLoading: true });
      try {
        const products = await fetchAllMyStore();
        set((state) => ({
          myStore: patchIfChanged(state.myStore, products),
          isStoreHydrated: true,
        }));
      } catch (error) {
        showError(error, "Unable to load My Store.");
        if (force) set({ myStore: [] });
      } finally {
        set({ isStoreLoading: false, storeRefreshInFlight: null });
      }
    })();

    set({ storeRefreshInFlight: promise });
    return promise;
  },

  markCatalogInStore: (productId, inStore) => {
    set((state) => {
      const catalogProducts = state.catalogProducts.map((product) =>
        product.id === productId ? { ...product, in_my_store: inStore } : product,
      );
      const productIndex = new Map(state.productIndex);
      const product = productIndex.get(productId);
      if (product) {
        const updated = { ...product, in_my_store: inStore };
        productIndex.set(productId, updated);
        if (product.slug) productIndex.set(product.slug, updated);
      }
      return { catalogProducts, productIndex };
    });
  },

  loadCatalog: async (force = false) => {
    const { catalogTab, debouncedCatalogSearch, catalogCacheKey, catalogProducts, myStore } =
      get();
    const cacheKey = `${catalogTab}|${debouncedCatalogSearch.trim().toLowerCase()}`;
    if (!force && cacheKey === catalogCacheKey && catalogProducts.length > 0) {
      return catalogProducts;
    }

    set({ isCatalogLoading: true });
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
      set({
        catalogProducts: enriched,
        productIndex: indexCatalogProducts(enriched),
        catalogCacheKey: cacheKey,
      });
      return enriched;
    } catch (error) {
      showError(error, "Unable to load catalog.");
      set({ catalogProducts: [], productIndex: new Map() });
      return [];
    } finally {
      set({ isCatalogLoading: false });
    }
  },

  getCachedProduct: (idOrSlug) => get().productIndex.get(idOrSlug),

  cacheProduct: (product) => {
    set((state) => {
      const productIndex = new Map(state.productIndex);
      productIndex.set(product.id, product);
      if (product.slug) productIndex.set(product.slug, product);
      const exists = state.catalogProducts.some((entry) => entry.id === product.id);
      const catalogProducts = exists
        ? state.catalogProducts.map((entry) => (entry.id === product.id ? product : entry))
        : [...state.catalogProducts, product];
      return { productIndex, catalogProducts };
    });
  },

  resolveProduct: async (idOrSlug) => {
    const cached = get().productIndex.get(idOrSlug);
    if (cached) return cached;
    const response = await getCatalogProduct(idOrSlug);
    const storeIds = new Set(get().myStore.map((entry) => entry.product_id));
    const product = { ...response.product, in_my_store: storeIds.has(response.product.id) };
    get().cacheProduct(product);
    return product;
  },

  loadFullCatalog: async (options = {}) => {
    const { force = false } = options;
    if (!force && get().isFullCatalogHydrated) return get().fullCatalogProducts;
    if (get().fullCatalogInFlight) return get().fullCatalogInFlight!;

    const promise = (async () => {
      try {
        const [peptides, pharmacy] = await Promise.all([
          fetchAllCatalog({ product_type: "peptides" }),
          fetchAllCatalog({ product_type: "pharmacy" }),
        ]);
        const combined = [...peptides, ...pharmacy];
        const storeIds = new Set(get().myStore.map((entry) => entry.product_id));
        const enriched = combined.map((product) => ({
          ...product,
          in_my_store: product.in_my_store ?? storeIds.has(product.id),
        }));
        set((state) => {
          const productIndex = new Map(state.productIndex);
          enriched.forEach((product) => {
            productIndex.set(product.id, product);
            if (product.slug) productIndex.set(product.slug, product);
          });
          return {
            fullCatalogProducts: patchIfChanged(state.fullCatalogProducts, enriched),
            productIndex,
            isFullCatalogHydrated: true,
            fullCatalogInFlight: null,
          };
        });
        return enriched;
      } catch (error) {
        showError(error, "Unable to load full catalog.");
        set({ fullCatalogInFlight: null });
        return [];
      }
    })();

    set({ fullCatalogInFlight: promise });
    return promise;
  },

  isInMyStore: (productId) => get().myStore.some((entry) => entry.product_id === productId),

  getStoreIdForProduct: (productId) =>
    get().myStore.find((entry) => entry.product_id === productId)?.store_id ?? null,

  getStoreProduct: (productId) =>
    get().myStore.find((entry) => entry.product_id === productId),

  addToMyStore: async (items) => {
    const previousStore = get().myStore;
    const productIndex = get().productIndex;
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

    set((state) => {
      const existingIds = new Set(state.myStore.map((entry) => entry.product_id));
      const additions = optimisticEntries.filter((entry) => !existingIds.has(entry.product_id));
      return { myStore: [...state.myStore, ...additions] };
    });
    items.forEach((item) => get().markCatalogInStore(item.productId, true));

    try {
      if (items.length === 1) {
        const item = items[0];
        const response = await addToMyStore(item.productId, item.retailPrice, item.variantId);
        set((state) => ({
          myStore: state.myStore.map((entry) =>
            entry.product_id === item.productId ? response.store_item : entry,
          ),
        }));
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

      set((state) => {
        const withoutTemps = state.myStore.filter((entry) => !entry.store_id.startsWith("temp-"));
        const existingIds = new Set(withoutTemps.map((entry) => entry.product_id));
        const merged = additions.filter((entry) => !existingIds.has(entry.product_id));
        return { myStore: [...withoutTemps, ...merged] };
      });
    } catch (error) {
      set({ myStore: previousStore });
      items.forEach((item) => get().markCatalogInStore(item.productId, false));
      throw error;
    }
  },

  removeFromMyStore: async (storeId) => {
    const previousStore = get().myStore;
    const removed = get().myStore.find((entry) => entry.store_id === storeId);
    set((state) => ({
      myStore: state.myStore.filter((entry) => entry.store_id !== storeId),
    }));
    if (removed) get().markCatalogInStore(removed.product_id, false);

    try {
      await removeFromStore(storeId);
    } catch (error) {
      set({ myStore: previousStore });
      if (removed) get().markCatalogInStore(removed.product_id, true);
      throw error;
    }
  },

  removeFromMyStoreByProductId: async (productId) => {
    const storeId = get().myStore.find((entry) => entry.product_id === productId)?.store_id;
    if (!storeId || storeId.startsWith("temp-")) {
      throw new Error("Product is not in My Store.");
    }
    await get().removeFromMyStore(storeId);
  },

  removeAllFromMyStore: async () => {
    const previousStore = get().myStore;
    set({ myStore: [] });
    previousStore.forEach((entry) => get().markCatalogInStore(entry.product_id, false));

    try {
      await removeAllFromStore();
    } catch (error) {
      set({ myStore: previousStore });
      previousStore.forEach((entry) => get().markCatalogInStore(entry.product_id, true));
      throw error;
    }
  },

  updateRetailPrice: async (storeId, retailPrice) => {
    const previousStore = get().myStore;
    set((state) => ({
      myStore: state.myStore.map((entry) =>
        entry.store_id === storeId ? { ...entry, retail_price: retailPrice } : entry,
      ),
    }));

    try {
      const response = await updateStoreProductPrice(storeId, retailPrice);
      set((state) => ({
        myStore: state.myStore.map((entry) =>
          entry.store_id === storeId ? response.store_item : entry,
        ),
      }));
    } catch (error) {
      set({ myStore: previousStore });
      throw error;
    }
  },

  setStoreVisibility: async (storeId, isVisible) => {
    const previousStore = get().myStore;
    set((state) => ({
      myStore: state.myStore.map((entry) =>
        entry.store_id === storeId ? { ...entry, is_visible: isVisible } : entry,
      ),
    }));

    try {
      const response = await updateStoreProductVisibility(storeId, isVisible);
      set((state) => ({
        myStore: state.myStore.map((entry) =>
          entry.store_id === storeId ? response.store_item : entry,
        ),
      }));
    } catch (error) {
      set({ myStore: previousStore });
      throw error;
    }
  },

  updateBranding: (patch) => {
    set((state) => ({ branding: { ...state.branding, ...patch } }));
  },
}));
