import { COMMERCE_API_URL } from "@/lib/admin/inventory/endpoints";

export const PATIENT_STORE_ENDPOINTS = {
  storeProducts: `${COMMERCE_API_URL}/patient/store/products`,
  storeProduct: (storeId: string) => `${COMMERCE_API_URL}/patient/store/products/${storeId}`,
  orders: `${COMMERCE_API_URL}/patient/orders`,
  order: (orderId: string) => `${COMMERCE_API_URL}/patient/orders/${orderId}`,
  orderTracking: (orderId: string) => `${COMMERCE_API_URL}/patient/orders/${orderId}/tracking`,
} as const;
