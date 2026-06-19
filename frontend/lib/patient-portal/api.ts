import { adminFetch } from "@/lib/admin/client";
import type { CommercePatientOrder } from "@/lib/orders/commerce-types";
import { PATIENT_STORE_ENDPOINTS } from "@/lib/patient-portal/endpoints";
import {
  mapCommerceOrder,
  mapCommerceOrderToPending,
} from "@/lib/patient-portal/map-order";
import type {
  PaginatedPatientStoreResponse,
  PatientStoreProductResponse,
} from "@/lib/patient-portal/store-types";
import type {
  PatientHistoryOrder,
  PatientPendingOrder,
  PlacePatientOrderPayload,
} from "@/lib/patient-portal/types";

const PATIENT_ORDERS_PAGE_SIZE = 50;
const PATIENT_STORE_PAGE_SIZE = 50;

type ListPatientStoreParams = {
  page?: number;
  limit?: number;
  search?: string;
};

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

export async function listPatientStoreProducts(
  params: ListPatientStoreParams = {},
): Promise<PaginatedPatientStoreResponse> {
  return adminFetch<PaginatedPatientStoreResponse>(
    `${PATIENT_STORE_ENDPOINTS.storeProducts}${buildQuery(params)}`,
  );
}

export async function getPatientStoreProduct(
  storeId: string,
): Promise<PatientStoreProductResponse> {
  return adminFetch<PatientStoreProductResponse>(
    PATIENT_STORE_ENDPOINTS.storeProduct(storeId),
  );
}

type PaginatedOrdersResponse = {
  status: boolean;
  orders: CommercePatientOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

export async function listPatientOrders(
  page = 1,
  limit = 50,
  reviewStatus?: string,
): Promise<{ orders: PatientHistoryOrder[]; pagination: PaginatedOrdersResponse["pagination"] }> {
  const response = await adminFetch<PaginatedOrdersResponse>(
    `${PATIENT_STORE_ENDPOINTS.orders}${buildQuery({
      page,
      limit,
      review_status: reviewStatus,
    })}`,
  );
  return {
    orders: response.orders.map(mapCommerceOrder),
    pagination: response.pagination,
  };
}

export async function listPatientPendingOrders(
  doctorName: string,
  options: { fetchAll?: boolean } = {},
): Promise<PatientPendingOrder[]> {
  const { fetchAll = false } = options;
  const limit = PATIENT_ORDERS_PAGE_SIZE;
  let page = 1;
  const pending: PatientPendingOrder[] = [];

  while (true) {
    const response = await adminFetch<PaginatedOrdersResponse>(
      `${PATIENT_STORE_ENDPOINTS.orders}${buildQuery({
        page,
        limit,
        review_status: "pending_review",
      })}`,
    );
    pending.push(
      ...response.orders.map((order) => mapCommerceOrderToPending(order, doctorName)),
    );
    if (!fetchAll || !response.pagination.has_next) break;
    page += 1;
  }

  return pending;
}

export async function fetchAllPatientHistoryOrders(
  options: { fetchAll?: boolean } = {},
): Promise<PatientHistoryOrder[]> {
  const { fetchAll = false } = options;
  const limit = PATIENT_ORDERS_PAGE_SIZE;
  let page = 1;
  const orders: PatientHistoryOrder[] = [];

  while (true) {
    const response = await listPatientOrders(page, limit, "approved");
    orders.push(...response.orders);
    if (!fetchAll || !response.pagination.has_next) break;
    page += 1;
  }

  const rejected = await listPatientOrders(1, limit, "rejected");
  orders.push(...rejected.orders);

  if (fetchAll) {
    let rejectedPage = 2;
    while (true) {
      const response = await listPatientOrders(rejectedPage, limit, "rejected");
      orders.push(...response.orders);
      if (!response.pagination.has_next) break;
      rejectedPage += 1;
    }
  }

  return orders.sort((a, b) => b.date.localeCompare(a.date));
}

export async function fetchRemainingPatientStoreProducts(
  startPage: number,
): Promise<PaginatedPatientStoreResponse["products"]> {
  const limit = PATIENT_STORE_PAGE_SIZE;
  let page = startPage;
  const products: PaginatedPatientStoreResponse["products"] = [];

  while (true) {
    const response = await listPatientStoreProducts({ page, limit });
    products.push(...response.products);
    if (!response.pagination.has_next) break;
    page += 1;
  }

  return products;
}

export async function getPatientOrder(orderId: string) {
  const response = await adminFetch<{ status: boolean; order: CommercePatientOrder }>(
    PATIENT_STORE_ENDPOINTS.order(orderId),
  );
  return mapCommerceOrder(response.order);
}

export async function getPatientOrderTracking(orderId: string) {
  return adminFetch<{
    status: boolean;
    order_id: string;
    tracking_number?: string;
    carrier?: string;
    tracking?: {
      id: string;
      carrier: string | null;
      tracking_number: string | null;
      status: string | null;
      shipped_at: string | null;
      delivered_at: string | null;
    }[];
    live_status?: Record<string, unknown> | null;
    message?: string;
  }>(PATIENT_STORE_ENDPOINTS.orderTracking(orderId));
}

export async function placePatientOrder(payload: PlacePatientOrderPayload) {
  const response = await adminFetch<{
    status: boolean;
    message: string;
    order: CommercePatientOrder;
  }>(PATIENT_STORE_ENDPOINTS.orders, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return {
    ...response,
    order: mapCommerceOrder(response.order),
    pending: mapCommerceOrderToPending(response.order, "Your physician"),
  };
}
