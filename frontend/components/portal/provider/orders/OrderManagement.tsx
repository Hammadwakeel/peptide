"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useOrders } from "@/context/OrdersProvider";
import { getPatientInitials } from "@/lib/patients/types";
import {
  ORDER_TAB_LABELS,
  PAYMENT_STATUS_LABELS,
  REVIEW_STATUS_LABELS,
  SHIPMENT_STATUS_LABELS,
  ordersToCsv,
  type Order,
  type OrderTab,
  type PaymentStatus,
  type ShipmentStatus,
} from "@/lib/orders/types";
import { toast } from "@/lib/toast";

function PaymentPill({ status }: { status: PaymentStatus }) {
  const styles: Record<PaymentStatus, string> = {
    paid: "bg-pacific-teal/10 text-pacific-teal",
    pending: "bg-coral-blush text-deep-teal/70",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-deep-teal/10 text-deep-teal/55",
    partial_refund: "bg-deep-teal/10 text-deep-teal/70",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}

function ShipmentPill({ status }: { status: ShipmentStatus }) {
  const styles: Record<ShipmentStatus, string> = {
    not_shipped: "bg-deep-teal/10 text-deep-teal/55",
    processing: "bg-coral-blush/60 text-deep-teal/70",
    shipped: "bg-pacific-teal/10 text-pacific-teal",
    delivered: "bg-pacific-teal/15 text-deep-teal",
    cancelled: "bg-deep-teal/10 text-deep-teal/45",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {SHIPMENT_STATUS_LABELS[status]}
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function filterByTab(orders: Order[], tab: OrderTab): Order[] {
  if (tab === "all") return orders;
  return orders.filter((order) => order.reviewStatus === tab);
}

export function OrderManagement() {
  const { clinicOrders, isLoading, refreshOrders } = useOrders();
  const [tab, setTab] = useState<OrderTab>("pending_review");
  const [search, setSearch] = useState("");

  const orders = useMemo(() => {
    let list = filterByTab(clinicOrders, tab);
    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (order) =>
          order.id.toLowerCase().includes(query) ||
          (order.orderNumber?.toLowerCase().includes(query) ?? false) ||
          (order.customerName?.toLowerCase().includes(query) ?? false),
      );
    }
    return list;
  }, [clinicOrders, tab, search]);

  function handleExport() {
    const csv = ordersToCsv(orders);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-${tab}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Orders exported.");
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-deep-teal/10 bg-deep-teal/[0.02] px-4 py-4 sm:px-5">
        <h2 className="font-serif text-xl font-light text-deep-teal">Order Management</h2>
        <p className="mt-1 text-sm text-deep-teal/60">
          Review patient orders, approve fulfillment, and track shipments.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(ORDER_TAB_LABELS) as OrderTab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === key
                ? "bg-deep-teal text-pure-white"
                : "border border-deep-teal/15 text-deep-teal/70"
            }`}
          >
            {ORDER_TAB_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders…"
          className="w-full rounded-xl border border-deep-teal/15 px-3 py-2 text-sm outline-none focus:border-pacific-teal lg:max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void refreshOrders()}
            className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-medium text-deep-teal hover:border-pacific-teal"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-medium text-deep-teal hover:border-pacific-teal"
          >
            Export Orders
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase tracking-wide text-deep-teal/45">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-4 py-3 font-medium">Review</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Shipment</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Profit</th>
              <th className="px-4 py-3 font-medium" aria-label="Action" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-deep-teal/50">
                  Loading orders…
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-deep-teal/5 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-deep-teal">
                    {order.orderNumber ?? order.id}
                  </td>
                  <td className="px-4 py-3">
                    {order.customerName ? (
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-deep-teal/10 text-[10px] font-medium text-deep-teal">
                          {getPatientInitials(order.customerName)}
                        </span>
                        <span className="text-deep-teal">{order.customerName}</span>
                      </div>
                    ) : (
                      <span className="text-deep-teal/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-deep-teal/70">
                    {order.reviewStatus ? REVIEW_STATUS_LABELS[order.reviewStatus] : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <PaymentPill status={order.paymentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <ShipmentPill status={order.shipmentStatus} />
                  </td>
                  <td className="px-4 py-3 text-deep-teal">{order.itemsCount}</td>
                  <td className="px-4 py-3 text-deep-teal">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-3 font-medium text-pacific-teal">
                    ${order.profit.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/portal/doctor/orders/${order.id}`}
                      className="text-pacific-teal hover:text-deep-teal"
                      aria-label={`View ${order.orderNumber ?? order.id}`}
                    >
                      →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!isLoading && orders.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-deep-teal/50">No orders in this view.</p>
        ) : null}
      </div>
    </div>
  );
}
