export const COMMERCE_API_URL =
  process.env.NEXT_PUBLIC_COMMERCE_API_URL ??
  process.env.NEXT_PUBLIC_API_COMMERCE_URL ??
  "http://127.0.0.1:8001";

export const INVENTORY_ADMIN_ENDPOINTS = {
  products: `${COMMERCE_API_URL}/admin/products`,
  product: (productId: string) => `${COMMERCE_API_URL}/admin/products/${productId}`,
  productStock: (productId: string) =>
    `${COMMERCE_API_URL}/admin/products/${productId}/stock`,
  productImages: (productId: string) =>
    `${COMMERCE_API_URL}/admin/products/${productId}/images`,
  categories: `${COMMERCE_API_URL}/admin/categories`,
} as const;
