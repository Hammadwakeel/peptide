"use client";

import { useMemo, useState } from "react";
import { useAdminOrders } from "@/context/OrdersProvider";
import { getPatientInitials } from "@/lib/patients/types";
import {
  PAYMENT_STATUS_LABELS,
  SHIPMENT_STATUS_LABELS,
  type PaymentStatus,
  type ShipmentStatus,
} from "@/lib/orders/types";
import { Tooltip } from "@/components/ui/Tippy";
import { fuseSearch } from "@/lib/search/fuse";
import { ORDER_SEARCH_KEYS } from "@/lib/search/keys";
import { toast } from "@/lib/toast";

function PaymentPill({ status }: { status: PaymentStatus }) {
  return (
    <span className="inline-flex rounded-full bg-deep-teal/5 px-2 py-0.5 text-xs font-medium text-deep-teal/70">
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}

function ShipmentPill({ status }: { status: ShipmentStatus }) {
  return (
    <span className="inline-flex rounded-full bg-deep-teal/5 px-2 py-0.5 text-xs font-medium text-deep-teal/70">
      {SHIPMENT_STATUS_LABELS[status]}
    </span>
  );
}

export function AdminOrdersView() {
  const { allOrders, toggleFlag, bulkUpdateStatus } = useAdminOrders();
  const [search, setSearch] = useState("");
  const [clinicFilter, setClinicFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentStatus>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<ShipmentStatus>("processing");

  const clinics = useMemo(
    () => Array.from(new Set(allOrders.map((order) => order.clinicName))).sort(),
    [allOrders],
  );

  const orders = useMemo(() => {
    let list = fuseSearch(allOrders, search, ORDER_SEARCH_KEYS);
    if (clinicFilter !== "all") {
      list = list.filter((order) => order.clinicName === clinicFilter);
    }
    if (paymentFilter !== "all") {
      list = list.filter((order) => order.paymentStatus === paymentFilter);
    }
    return list;
  }, [allOrders, search, clinicFilter, paymentFilter]);

  function toggleSelect(orderId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === orders.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(orders.map((order) => order.id)));
    }
  }

  function handleBulkUpdate() {
    if (selected.size === 0) {
      toast.error("Select at least one order.");
      return;
    }
    bulkUpdateStatus(Array.from(selected), bulkStatus);
    toast.success(`Updated ${selected.size} orders to ${SHIPMENT_STATUS_LABELS[bulkStatus]}.`);
    setSelected(new Set());
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-deep-teal/10 bg-deep-teal/[0.02] px-4 py-4 sm:px-5">
        <h2 className="font-sans text-xl font-semibold text-deep-teal">All Orders</h2>
        <p className="mt-1 text-sm text-deep-teal/60">
          Cross-clinic order visibility with bulk actions and flagging.
        </p>
      </div>

      <div className="rounded-2xl border border-deep-teal/10 bg-pure-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders…"
            className="rounded-xl border border-deep-teal/15 px-3 py-2 text-sm outline-none focus:border-pacific-teal sm:col-span-2"
          />
          <select
            value={clinicFilter}
            onChange={(e) => setClinicFilter(e.target.value)}
            className="rounded-xl border border-deep-teal/15 px-3 py-2 text-sm"
          >
            <option value="all">All clinics</option>
            {clinics.map((clinic) => (
              <option key={clinic} value={clinic}>{clinic}</option>
            ))}
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as "all" | PaymentStatus)}
            className="rounded-xl border border-deep-teal/15 px-3 py-2 text-sm"
          >
            <option value="all">All payment statuses</option>
            {(Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((status) => (
              <option key={status} value={status}>{PAYMENT_STATUS_LABELS[status]}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-deep-teal/10 pt-4">
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value as ShipmentStatus)}
            className="rounded-xl border border-deep-teal/15 px-3 py-2 text-sm"
          >
            {(Object.keys(SHIPMENT_STATUS_LABELS) as ShipmentStatus[]).map((status) => (
              <option key={status} value={status}>{SHIPMENT_STATUS_LABELS[status]}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleBulkUpdate}
            className="rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-pacific-teal"
          >
            Bulk update status ({selected.size})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase tracking-wide text-deep-teal/45">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={orders.length > 0 && selected.size === orders.length}
                  onChange={toggleSelectAll}
                  aria-label="Select all orders"
                />
              </th>
              <th className="px-4 py-3 font-medium">Order ID</th>
              <th className="px-4 py-3 font-medium">Clinic</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Doctor</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Shipment</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Profit</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className={`border-b border-deep-teal/5 ${order.flagged ? "bg-coral-blush/10" : ""}`}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(order.id)}
                    onChange={() => toggleSelect(order.id)}
                    aria-label={`Select ${order.id}`}
                  />
                </td>
                <td className="px-4 py-3 font-mono text-xs font-medium text-deep-teal">{order.id}</td>
                <td className="px-4 py-3 text-deep-teal/70">{order.clinicName}</td>
                <td className="px-4 py-3">
                  {order.customerName ? (
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-full bg-deep-teal/10 text-[10px] font-medium">
                        {getPatientInitials(order.customerName)}
                      </span>
                      {order.customerName}
                    </div>
                  ) : (
                    "Clinic"
                  )}
                </td>
                <td className="px-4 py-3 text-deep-teal/70">{order.doctorName}</td>
                <td className="px-4 py-3"><PaymentPill status={order.paymentStatus} /></td>
                <td className="px-4 py-3"><ShipmentPill status={order.shipmentStatus} /></td>
                <td className="px-4 py-3 text-deep-teal">${order.total}</td>
                <td className="px-4 py-3 font-medium text-pacific-teal">${order.profit}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Tooltip content={order.flagged ? "Remove flag" : "Flag order for review"}>
                      <button
                        type="button"
                        onClick={() => {
                          toggleFlag(order.id);
                          toast.success(order.flagged ? "Flag removed." : "Order flagged.");
                        }}
                        className={`text-lg leading-none ${order.flagged ? "text-coral-blush" : "text-deep-teal/30 hover:text-coral-blush"}`}
                        aria-label={order.flagged ? "Remove flag" : "Flag order"}
                      >
                        ⚑
                      </button>
                    </Tooltip>
                    <Tooltip content="Initiate a refund for this order">
                      <button
                        type="button"
                        onClick={() => toast.success(`Refund initiated for ${order.id}.`)}
                        className="text-xs text-pacific-teal hover:underline"
                      >
                        Refund
                      </button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-deep-teal/50">No orders match your filters.</p>
        ) : null}
      </div>
    </div>
  );
}
