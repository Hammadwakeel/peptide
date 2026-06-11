"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Package, RefreshCw } from "lucide-react";
import {
  ProviderPageSection,
} from "@/components/portal/provider/shared/ProviderPageSection";
import {
  ProviderPageToolbar,
  toolbarBtnClass,
  toolbarBtnPrimaryClass,
} from "@/components/portal/provider/shared/ProviderPageToolbar";
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
import { Tooltip } from "@/components/ui/Tippy";
import { fuseSearch } from "@/lib/search/fuse";
import { ORDER_SEARCH_KEYS } from "@/lib/search/keys";
import { toast } from "@/lib/toast";

function PaymentPill({ status }: { status: PaymentStatus }) {
  const styles: Record<PaymentStatus, string> = {
    paid: "bg-pacific-teal/10 text-pacific-teal",
    pending: "bg-coral-blush text-deep-teal/70",
    failed: "bg-coral-blush/60 text-deep-teal",
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

function filterByTab(orders: Order[], tab: OrderTab): Order[] {
  if (tab === "all") return orders;
  return orders.filter((order) => order.reviewStatus === tab);
}

export function OrderManagement() {
  const { clinicOrders, isLoading, refreshOrders } = useOrders();
  const [tab, setTab] = useState<OrderTab>("pending_review");
  const [search, setSearch] = useState("");

  const orders = useMemo(() => {
    const list = filterByTab(clinicOrders, tab);
    return fuseSearch(list, search, ORDER_SEARCH_KEYS);
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
      <ProviderPageToolbar title="Orders">
        <select
          value={tab}
          onChange={(e) => setTab(e.target.value as OrderTab)}
          className="rounded-full border border-deep-teal/25 bg-pure-white px-4 py-2 text-sm text-deep-teal outline-none focus:border-deep-teal"
        >
          {(Object.keys(ORDER_TAB_LABELS) as OrderTab[]).map((key) => (
            <option key={key} value={key}>
              {ORDER_TAB_LABELS[key]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleExport}
          className={toolbarBtnClass}
        >
          <Download className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Export</span>
        </button>
        <button
          type="button"
          onClick={() => void refreshOrders({ force: true })}
          disabled={isLoading}
          className={toolbarBtnPrimaryClass}
          aria-label="Refresh orders"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
        </button>
      </ProviderPageToolbar>

      <ProviderPageSection
        icon={Package}
        title="Order list"
        subtitle={
          isLoading
            ? "Loading…"
            : `${orders.length} order${orders.length === 1 ? "" : "s"} · ${ORDER_TAB_LABELS[tab]}`
        }
        noPadding
      >
        <div className="border-b border-deep-teal/10 p-4 sm:px-5">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders…"
            className="w-full rounded-full border border-deep-teal/15 px-4 py-2 text-sm outline-none focus:border-pacific-teal sm:max-w-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-deep-teal/10 bg-surface-muted/50 text-xs uppercase tracking-wide text-deep-teal/45">
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
                      <Tooltip content={`View order ${order.orderNumber ?? order.id}`}>
                        <Link
                          href={`/portal/doctor/orders/${order.id}`}
                          className="text-pacific-teal hover:text-deep-teal"
                          aria-label={`View ${order.orderNumber ?? order.id}`}
                        >
                          →
                        </Link>
                      </Tooltip>
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
      </ProviderPageSection>
    </div>
  );
}
