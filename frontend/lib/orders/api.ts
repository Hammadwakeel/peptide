import { adminFetch } from "@/lib/admin/client";
import type { CommerceClinicOrder, ReviewStatus } from "@/lib/orders/commerce-types";
import { CLINIC_ORDERS_ENDPOINTS } from "@/lib/orders/endpoints";

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

type PaginatedClinicOrdersResponse = {
  status: boolean;
  orders: CommerceClinicOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  clinic?: { id: string; clinic_name: string };
};

export async function listClinicOrders(params: {
  page?: number;
  limit?: number;
  review_status?: ReviewStatus;
} = {}) {
  return adminFetch<PaginatedClinicOrdersResponse>(
    `${CLINIC_ORDERS_ENDPOINTS.orders}${buildQuery(params)}`,
  );
}

export async function fetchAllClinicOrders(reviewStatus?: ReviewStatus) {
  const limit = 500;
  let page = 1;
  const orders: CommerceClinicOrder[] = [];

  while (true) {
    const response = await listClinicOrders({ page, limit, review_status: reviewStatus });
    orders.push(...response.orders);
    if (!response.pagination.has_next) break;
    page += 1;
  }

  return orders;
}

export async function getClinicOrder(orderId: string) {
  const response = await adminFetch<{ status: boolean; order: CommerceClinicOrder }>(
    CLINIC_ORDERS_ENDPOINTS.order(orderId),
  );
  return response.order;
}

export async function approveClinicOrder(orderId: string) {
  return adminFetch<{ status: boolean; message: string; order: CommerceClinicOrder }>(
    CLINIC_ORDERS_ENDPOINTS.approve(orderId),
    { method: "POST" },
  );
}

export async function rejectClinicOrder(orderId: string, reason: string) {
  return adminFetch<{ status: boolean; message: string; order: CommerceClinicOrder }>(
    CLINIC_ORDERS_ENDPOINTS.reject(orderId),
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    },
  );
}
