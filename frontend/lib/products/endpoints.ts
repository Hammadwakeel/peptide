import { COMMERCE_API_URL } from "@/lib/admin/inventory/endpoints";

export const PROVIDER_INVENTORY_ENDPOINTS = {
  catalog: `${COMMERCE_API_URL}/provider/catalog`,
  catalogProduct: (slug: string) => `${COMMERCE_API_URL}/provider/catalog/${slug}`,
  setRetailPrice: (productId: string) =>
    `${COMMERCE_API_URL}/provider/catalog/${productId}/retail-price`,
  storeProducts: `${COMMERCE_API_URL}/provider/store/products`,
  storeProductsBatch: `${COMMERCE_API_URL}/provider/store/products/batch`,
  storeProduct: (storeId: string) =>
    `${COMMERCE_API_URL}/provider/store/products/${storeId}`,
  storeProductVisibility: (storeId: string) =>
    `${COMMERCE_API_URL}/provider/store/products/${storeId}/visibility`,
  storeProductsAll: `${COMMERCE_API_URL}/provider/store/products/all`,
} as const;
