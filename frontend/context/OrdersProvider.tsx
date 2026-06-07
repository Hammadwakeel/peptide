"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MOCK_ORDERS } from "@/lib/orders/mock-data";
import type {
  CartLineItem,
  Order,
  OrderTimelineEntry,
  OrderTracking,
  OrderType,
  PaymentStatus,
  ShipmentStatus,
} from "@/lib/orders/types";
import { buildTrackingUrl } from "@/lib/orders/types";

const CLINIC_ID = "clinic-001";
const CLINIC_NAME = "Frontier Wellness Clinic";

function cloneOrders(data: Order[]): Order[] {
  return data.map((order) => ({
    ...order,
    lineItems: order.lineItems.map((item) => ({ ...item })),
    timeline: order.timeline.map((entry) => ({ ...entry })),
    tracking: order.tracking ? { ...order.tracking } : undefined,
  }));
}

type CreateOrderPayload = {
  orderType: OrderType;
  customerId?: string;
  customerName?: string;
  doctorName: string;
  cart: CartLineItem[];
  patientEmail?: string;
  patientPhone?: string;
};

type OrdersContextValue = {
  orders: Order[];
  clinicOrders: Order[];
  getOrder: (id: string) => Order | undefined;
  createOrder: (payload: CreateOrderPayload) => Order;
  updateTracking: (orderId: string, tracking: OrderTracking) => void;
  applyRefund: (orderId: string, amount: number, reason: string, full: boolean) => void;
  applyTrackingImport: (
    rows: { orderId: string; carrier: string; trackingNumber: string; shippedDate: string }[],
  ) => { updated: number; failed: number };
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => cloneOrders(MOCK_ORDERS));

  const clinicOrders = useMemo(
    () => orders.filter((order) => order.clinicId === CLINIC_ID),
    [orders],
  );

  const getOrder = useCallback(
    (id: string) => orders.find((order) => order.id === id),
    [orders],
  );

  const createOrder = useCallback((payload: CreateOrderPayload) => {
    const id = `ORD-${Date.now().toString().slice(-4)}`;
    const lineItems = payload.cart.map((item, index) => ({
      id: `li-new-${index}`,
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      qty: item.qty,
      unitPrice: item.unitPrice,
      total: item.qty * item.unitPrice,
    }));
    const total = lineItems.reduce((sum, item) => sum + item.total, 0);
    const netCost = Math.round(total * 0.62);
    const profit = total - netCost;
    const timeline: OrderTimelineEntry[] = [
      {
        id: `tl-${Date.now()}`,
        date: new Date().toISOString(),
        status: "Created",
        note: `Order created for ${payload.orderType === "clinic" ? "clinic" : payload.customerName ?? "customer"}.`,
      },
    ];

    const order: Order = {
      id,
      orderType: payload.orderType,
      customerId: payload.customerId,
      customerName: payload.customerName,
      doctorName: payload.doctorName,
      paymentDate: payload.orderType === "clinic" ? new Date().toISOString().slice(0, 10) : null,
      paymentStatus: payload.orderType === "clinic" ? "paid" : "pending",
      shipmentStatus: "not_shipped",
      itemsCount: lineItems.reduce((sum, item) => sum + item.qty, 0),
      total,
      netCost,
      profit,
      lineItems,
      patientEmail: payload.patientEmail,
      patientPhone: payload.patientPhone,
      timeline,
      clinicId: CLINIC_ID,
      clinicName: CLINIC_NAME,
    };

    setOrders((current) => [order, ...current]);
    return order;
  }, []);

  const updateTracking = useCallback((orderId: string, tracking: OrderTracking) => {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order;
        const trackingUrl = buildTrackingUrl(tracking.carrier, tracking.trackingNumber);
        const entry: OrderTimelineEntry = {
          id: `tl-${Date.now()}`,
          date: new Date().toISOString(),
          status: "Shipped",
          note: `${tracking.carrier} ${tracking.trackingNumber}`,
        };
        return {
          ...order,
          tracking: { ...tracking, trackingUrl },
          shipmentStatus: "shipped" as ShipmentStatus,
          timeline: [entry, ...order.timeline],
        };
      }),
    );
  }, []);

  const applyRefund = useCallback(
    (orderId: string, amount: number, reason: string, full: boolean) => {
      setOrders((current) =>
        current.map((order) => {
          if (order.id !== orderId) return order;
          const paymentStatus: PaymentStatus = full ? "refunded" : "partial_refund";
          const entry: OrderTimelineEntry = {
            id: `tl-${Date.now()}`,
            date: new Date().toISOString(),
            status: full ? "Full Refund" : "Partial Refund",
            note: `$${amount} — ${reason}`,
          };
          return {
            ...order,
            paymentStatus,
            timeline: [entry, ...order.timeline],
          };
        }),
      );
    },
    [],
  );

  const applyTrackingImport = useCallback(
    (
      rows: { orderId: string; carrier: string; trackingNumber: string; shippedDate: string }[],
    ) => {
      let updated = 0;
      let failed = 0;

      setOrders((current) =>
        current.map((order) => {
          const row = rows.find((item) => item.orderId === order.id);
          if (!row) return order;
          updated += 1;
          const trackingUrl = buildTrackingUrl(row.carrier, row.trackingNumber);
          const entry: OrderTimelineEntry = {
            id: `tl-import-${order.id}-${Date.now()}`,
            date: new Date().toISOString(),
            status: "Shipped",
            note: `Tracking imported: ${row.carrier} ${row.trackingNumber}`,
          };
          return {
            ...order,
            tracking: {
              carrier: row.carrier,
              trackingNumber: row.trackingNumber,
              shippedDate: row.shippedDate,
              trackingUrl,
            },
            shipmentStatus: "shipped" as ShipmentStatus,
            timeline: [entry, ...order.timeline],
          };
        }),
      );

      failed = rows.length - updated;
      return { updated, failed };
    },
    [],
  );

  const value = useMemo(
    () => ({
      orders,
      clinicOrders,
      getOrder,
      createOrder,
      updateTracking,
      applyRefund,
      applyTrackingImport,
    }),
    [orders, clinicOrders, getOrder, createOrder, updateTracking, applyRefund, applyTrackingImport],
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

// Admin uses all orders with separate state for flags/bulk updates
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
        const entry: OrderTimelineEntry = {
          id: `t-import-${Date.now()}`,
          date: new Date().toISOString(),
          status: "Shipped",
          note: `Tracking updated: ${tracking.carrier} ${tracking.trackingNumber}`,
        };
        return {
          ...order,
          tracking: { ...tracking, trackingUrl },
          shipmentStatus: "shipped" as ShipmentStatus,
          timeline: [entry, ...order.timeline],
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
          const entry: OrderTimelineEntry = {
            id: `t-bulk-${Date.now()}-${order.id}`,
            date: new Date().toISOString(),
            status: "Shipped",
            note: `Tracking imported: ${row.carrier} ${row.trackingNumber}`,
          };
          return {
            ...order,
            tracking: {
              carrier: row.carrier,
              trackingNumber: row.trackingNumber,
              shippedDate: row.shippedDate,
              trackingUrl,
            },
            shipmentStatus: "shipped" as ShipmentStatus,
            timeline: [entry, ...order.timeline],
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
