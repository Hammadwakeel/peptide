"use client";

import { create } from "zustand";
import {
  approveClinicOrder,
  fetchAllClinicOrders,
  getClinicOrder,
  rejectClinicOrder,
} from "@/lib/orders/api";
import { mapClinicOrderToUi } from "@/lib/orders/map-clinic-order";
import type { Order, OrderTracking, ShipmentStatus } from "@/lib/orders/types";
import { buildTrackingUrl } from "@/lib/orders/types";
import { patchIfChanged } from "@/lib/cache/set-if-changed";
import { showError } from "@/lib/toast";

function cloneOrders(data: Order[]): Order[] {
  return data.map((order) => ({
    ...order,
    lineItems: order.lineItems.map((item) => ({ ...item })),
    timeline: order.timeline.map((entry) => ({ ...entry })),
    tracking: order.tracking ? { ...order.tracking } : undefined,
  }));
}

type RefreshOptions = { force?: boolean };

type OrdersState = {
  orders: Order[];
  isLoading: boolean;
  isHydrated: boolean;
  refreshInFlight: Promise<void> | null;
  refreshOrders: (options?: RefreshOptions) => Promise<void>;
  reset: () => void;
  getOrder: (id: string) => Order | undefined;
  fetchOrder: (id: string) => Promise<Order>;
  approveOrder: (orderId: string) => Promise<Order>;
  rejectOrder: (orderId: string, reason: string) => Promise<Order>;
  applyTrackingImport: (
    rows: { orderId: string; carrier: string; trackingNumber: string; shippedDate: string }[],
  ) => { updated: number; failed: number };
  updateTracking: (orderId: string, tracking: OrderTracking) => void;
  applyRefund: (
    orderId: string,
    amount: number,
    reason: string,
    isFull: boolean,
  ) => void;
  upsertOrder: (order: Order) => void;
};

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  isLoading: true,
  isHydrated: false,
  refreshInFlight: null,

  reset: () => set({ orders: [], isLoading: true, isHydrated: false, refreshInFlight: null }),

  upsertOrder: (order) => {
    set((state) => {
      const index = state.orders.findIndex((entry) => entry.id === order.id);
      if (index === -1) return { orders: [order, ...state.orders] };
      const next = [...state.orders];
      next[index] = order;
      return { orders: next };
    });
  },

  refreshOrders: async (options = {}) => {
    const { force = false } = options;
    if (!force && get().isHydrated) return;
    if (get().refreshInFlight) return get().refreshInFlight!;

    const promise = (async () => {
      if (!get().isHydrated) set({ isLoading: true });
      try {
        const rows = await fetchAllClinicOrders();
        const next = rows.map(mapClinicOrderToUi);
        set((state) => ({
          orders: patchIfChanged(state.orders, next),
          isHydrated: true,
        }));
      } catch (error) {
        showError(error, "Unable to load clinic orders.");
        if (force) set({ orders: [] });
      } finally {
        set({ isLoading: false, refreshInFlight: null });
      }
    })();

    set({ refreshInFlight: promise });
    return promise;
  },

  getOrder: (id) =>
    get().orders.find((order) => order.id === id || order.orderNumber === id),

  fetchOrder: async (id) => {
    const cached = get().getOrder(id);
    if (cached?.lineItems.length) return cached;
    const row = await getClinicOrder(id);
    const mapped = mapClinicOrderToUi(row);
    get().upsertOrder(mapped);
    return mapped;
  },

  approveOrder: async (orderId) => {
    const response = await approveClinicOrder(orderId);
    const mapped = mapClinicOrderToUi(response.order);
    get().upsertOrder(mapped);
    return mapped;
  },

  rejectOrder: async (orderId, reason) => {
    const response = await rejectClinicOrder(orderId, reason);
    const mapped = mapClinicOrderToUi(response.order);
    get().upsertOrder(mapped);
    return mapped;
  },

  applyTrackingImport: (rows) => {
    let updated = 0;
    set((state) => ({
      orders: state.orders.map((order) => {
        const row = rows.find(
          (entry) => entry.orderId === order.id || entry.orderId === order.orderNumber,
        );
        if (!row) return order;
        updated += 1;
        const trackingUrl = buildTrackingUrl(row.carrier, row.trackingNumber);
        return {
          ...order,
          tracking: {
            carrier: row.carrier,
            trackingNumber: row.trackingNumber,
            shippedDate: row.shippedDate,
            trackingUrl,
          },
          shipmentStatus: "shipped" as ShipmentStatus,
        };
      }),
    }));
    return { updated, failed: rows.length - updated };
  },

  updateTracking: (orderId, tracking) => {
    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId && order.orderNumber !== orderId) return order;
        const trackingUrl = buildTrackingUrl(tracking.carrier, tracking.trackingNumber);
        return {
          ...order,
          tracking: { ...tracking, trackingUrl },
          shipmentStatus: "shipped" as ShipmentStatus,
        };
      }),
    }));
  },

  applyRefund: (orderId, _amount, reason, isFull) => {
    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId && order.orderNumber !== orderId) return order;
        return {
          ...order,
          paymentStatus: isFull ? ("refunded" as const) : ("partial_refund" as const),
          timeline: [
            ...order.timeline,
            {
              id: `refund-${Date.now()}`,
              status: isFull ? "Refunded" : "Partial refund",
              date: new Date().toISOString(),
              note: reason,
            },
          ],
        };
      }),
    }));
  },
}));

type AdminOrdersState = {
  allOrders: Order[];
  isLoading: boolean;
  isHydrated: boolean;
  refreshInFlight: Promise<void> | null;
  refreshOrders: (options?: RefreshOptions) => Promise<void>;
  reset: () => void;
  toggleFlag: (orderId: string) => void;
  bulkUpdateStatus: (orderIds: string[], status: ShipmentStatus) => void;
  updateTracking: (orderId: string, tracking: OrderTracking) => void;
  applyTrackingImport: (
    rows: { orderId: string; carrier: string; trackingNumber: string; shippedDate: string }[],
  ) => { updated: number; failed: number };
};

export const useAdminOrdersStore = create<AdminOrdersState>((set, get) => ({
  allOrders: [],
  isLoading: true,
  isHydrated: false,
  refreshInFlight: null,

  reset: () =>
    set({ allOrders: [], isLoading: true, isHydrated: false, refreshInFlight: null }),

  refreshOrders: async (options = {}) => {
    const { force = false } = options;
    if (!force && get().isHydrated) return;
    if (get().refreshInFlight) return get().refreshInFlight!;

    const promise = (async () => {
      if (!get().isHydrated) set({ isLoading: true });
      try {
        const rows = await fetchAllClinicOrders();
        const next = rows.map(mapClinicOrderToUi);
        set((state) => ({
          allOrders: patchIfChanged(state.allOrders, next),
          isHydrated: true,
        }));
      } catch (error) {
        showError(error, "Unable to load orders.");
        if (force) set({ allOrders: [] });
      } finally {
        set({ isLoading: false, refreshInFlight: null });
      }
    })();

    set({ refreshInFlight: promise });
    return promise;
  },

  toggleFlag: (orderId) => {
    set((state) => ({
      allOrders: state.allOrders.map((order) =>
        order.id === orderId ? { ...order, flagged: !order.flagged } : order,
      ),
    }));
  },

  bulkUpdateStatus: (orderIds, status) => {
    set((state) => ({
      allOrders: state.allOrders.map((order) =>
        orderIds.includes(order.id) ? { ...order, shipmentStatus: status } : order,
      ),
    }));
  },

  updateTracking: (orderId, tracking) => {
    set((state) => ({
      allOrders: state.allOrders.map((order) => {
        if (order.id !== orderId) return order;
        const trackingUrl = buildTrackingUrl(tracking.carrier, tracking.trackingNumber);
        return {
          ...order,
          tracking: { ...tracking, trackingUrl },
          shipmentStatus: "shipped" as ShipmentStatus,
        };
      }),
    }));
  },

  applyTrackingImport: (rows) => {
    let updated = 0;
    set((state) => ({
      allOrders: state.allOrders.map((order) => {
        const row = rows.find(
          (entry) => entry.orderId === order.id || entry.orderId === order.orderNumber,
        );
        if (!row) return order;
        updated += 1;
        const trackingUrl = buildTrackingUrl(row.carrier, row.trackingNumber);
        return {
          ...order,
          tracking: {
            carrier: row.carrier,
            trackingNumber: row.trackingNumber,
            shippedDate: row.shippedDate,
            trackingUrl,
          },
          shipmentStatus: "shipped" as ShipmentStatus,
        };
      }),
    }));
    return { updated, failed: rows.length - updated };
  },
}));
