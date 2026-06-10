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
  approveClinicOrder,
  fetchAllClinicOrders,
  getClinicOrder,
  rejectClinicOrder,
} from "@/lib/orders/api";
import { mapClinicOrderToUi } from "@/lib/orders/map-clinic-order";
import { MOCK_ORDERS } from "@/lib/orders/mock-data";
import type { Order, OrderTracking, ShipmentStatus } from "@/lib/orders/types";
import { buildTrackingUrl } from "@/lib/orders/types";
import { showError } from "@/lib/toast";

function cloneOrders(data: Order[]): Order[] {
  return data.map((order) => ({
    ...order,
    lineItems: order.lineItems.map((item) => ({ ...item })),
    timeline: order.timeline.map((entry) => ({ ...entry })),
    tracking: order.tracking ? { ...order.tracking } : undefined,
  }));
}

type OrdersContextValue = {
  orders: Order[];
  clinicOrders: Order[];
  isLoading: boolean;
  refreshOrders: () => Promise<void>;
  getOrder: (id: string) => Order | undefined;
  fetchOrder: (id: string) => Promise<Order>;
  approveOrder: (orderId: string) => Promise<Order>;
  rejectOrder: (orderId: string, reason: string) => Promise<Order>;
  applyTrackingImport: (
    rows: { orderId: string; carrier: string; trackingNumber: string; shippedDate: string }[],
  ) => { updated: number; failed: number };
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await fetchAllClinicOrders();
      setOrders(rows.map(mapClinicOrderToUi));
    } catch (error) {
      showError(error, "Unable to load clinic orders.");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshOrders();
  }, [refreshOrders]);

  const clinicOrders = useMemo(() => orders, [orders]);

  const getOrder = useCallback(
    (id: string) =>
      orders.find((order) => order.id === id || order.orderNumber === id),
    [orders],
  );

  const upsertOrder = useCallback((order: Order) => {
    setOrders((current) => {
      const index = current.findIndex((entry) => entry.id === order.id);
      if (index === -1) return [order, ...current];
      const next = [...current];
      next[index] = order;
      return next;
    });
  }, []);

  const fetchOrder = useCallback(
    async (id: string) => {
      const cached = getOrder(id);
      if (cached?.lineItems.length) return cached;
      const row = await getClinicOrder(id);
      const mapped = mapClinicOrderToUi(row);
      upsertOrder(mapped);
      return mapped;
    },
    [getOrder, upsertOrder],
  );

  const approveOrder = useCallback(
    async (orderId: string) => {
      const response = await approveClinicOrder(orderId);
      const mapped = mapClinicOrderToUi(response.order);
      upsertOrder(mapped);
      return mapped;
    },
    [upsertOrder],
  );

  const rejectOrder = useCallback(
    async (orderId: string, reason: string) => {
      const response = await rejectClinicOrder(orderId, reason);
      const mapped = mapClinicOrderToUi(response.order);
      upsertOrder(mapped);
      return mapped;
    },
    [upsertOrder],
  );

  const applyTrackingImport = useCallback(
    (
      rows: { orderId: string; carrier: string; trackingNumber: string; shippedDate: string }[],
    ) => {
      let updated = 0;
      setOrders((current) =>
        current.map((order) => {
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
      );
      return { updated, failed: rows.length - updated };
    },
    [],
  );

  const value = useMemo(
    () => ({
      orders,
      clinicOrders,
      isLoading,
      refreshOrders,
      getOrder,
      fetchOrder,
      approveOrder,
      rejectOrder,
      applyTrackingImport,
    }),
    [
      orders,
      clinicOrders,
      isLoading,
      refreshOrders,
      getOrder,
      fetchOrder,
      approveOrder,
      rejectOrder,
      applyTrackingImport,
    ],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within OrdersProvider");
  }
  return context;
}

type AdminOrdersContextValue = {
  allOrders: Order[];
  toggleFlag: (orderId: string) => void;
  bulkUpdateStatus: (orderIds: string[], status: ShipmentStatus) => void;
  updateTracking: (orderId: string, tracking: OrderTracking) => void;
  applyTrackingImport: (
    rows: { orderId: string; carrier: string; trackingNumber: string; shippedDate: string }[],
  ) => { updated: number; failed: number };
};

const AdminOrdersContext = createContext<AdminOrdersContextValue | null>(null);

export function AdminOrdersProvider({ children }: { children: ReactNode }) {
  const [allOrders, setAllOrders] = useState<Order[]>(() => cloneOrders(MOCK_ORDERS));

  const toggleFlag = useCallback((orderId: string) => {
    setAllOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, flagged: !order.flagged } : order,
      ),
    );
  }, []);

  const bulkUpdateStatus = useCallback((orderIds: string[], status: ShipmentStatus) => {
    setAllOrders((current) =>
      current.map((order) =>
        orderIds.includes(order.id) ? { ...order, shipmentStatus: status } : order,
      ),
    );
  }, []);

  const updateTracking = useCallback((orderId: string, tracking: OrderTracking) => {
    setAllOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order;
        const trackingUrl = buildTrackingUrl(tracking.carrier, tracking.trackingNumber);
        return {
          ...order,
          tracking: { ...tracking, trackingUrl },
          shipmentStatus: "shipped" as ShipmentStatus,
        };
      }),
    );
  }, []);

  const applyTrackingImport = useCallback(
    (rows: { orderId: string; carrier: string; trackingNumber: string; shippedDate: string }[]) => {
      let updated = 0;
      setAllOrders((current) =>
        current.map((order) => {
          const row = rows.find((entry) => entry.orderId === order.id);
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
      );
      return { updated, failed: rows.length - updated };
    },
    [],
  );

  const value = useMemo(
    () => ({ allOrders, toggleFlag, bulkUpdateStatus, updateTracking, applyTrackingImport }),
    [allOrders, toggleFlag, bulkUpdateStatus, updateTracking, applyTrackingImport],
  );

  return <AdminOrdersContext.Provider value={value}>{children}</AdminOrdersContext.Provider>;
}

export function useAdminOrders() {
  const context = useContext(AdminOrdersContext);
  if (!context) {
    throw new Error("useAdminOrders must be used within AdminOrdersProvider");
  }
  return context;
}
