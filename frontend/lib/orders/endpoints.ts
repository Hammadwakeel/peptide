import { COMMERCE_API_URL } from "@/lib/admin/inventory/endpoints";

export const CLINIC_ORDERS_ENDPOINTS = {
  orders: `${COMMERCE_API_URL}/provider/orders`,
  order: (orderId: string) => `${COMMERCE_API_URL}/provider/orders/${orderId}`,
  approve: (orderId: string) => `${COMMERCE_API_URL}/provider/orders/${orderId}/approve`,
  reject: (orderId: string) => `${COMMERCE_API_URL}/provider/orders/${orderId}/reject`,
} as const;
