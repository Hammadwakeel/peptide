"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePatientPortal } from "@/context/PatientPortalProvider";

const STATUS_LABELS = {
  paid: "Approved",
  shipped: "Shipped",
  delivered: "Delivered",
} as const;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function OrderHistoryTab() {
  const { historyOrders, ordersLoading, refreshOrders } = usePatientPortal();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return historyOrders;
    return historyOrders.filter(
      (order) =>
        order.orderId.toLowerCase().includes(query) ||
        STATUS_LABELS[order.status].toLowerCase().includes(query) ||
        (order.reviewStatus?.toLowerCase().includes(query) ?? false),
    );
  }, [historyOrders, search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light text-deep-teal">Your Order History</h1>
          <p className="mt-1 text-sm text-deep-teal/55">{historyOrders.length} orders</p>
        </div>
        <div className="flex gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders…"
            className="w-full rounded-xl border border-deep-teal/15 px-3 py-2 text-sm outline-none focus:border-pacific-teal sm:max-w-xs"
          />
          <button
            type="button"
            onClick={() => void refreshOrders()}
            className="rounded-xl border border-deep-teal/15 px-3 py-2 text-sm text-deep-teal hover:border-pacific-teal"
          >
            Refresh
          </button>
        </div>
      </div>

      {ordersLoading ? (
        <p className="py-12 text-center text-sm text-deep-teal/50">Loading orders…</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-deep-teal/15 px-6 py-16 text-center">
          <p className="font-medium text-deep-teal">No orders found</p>
          <p className="mt-1 text-sm text-deep-teal/50">
            {historyOrders.length === 0
              ? "Approved and completed orders will appear here."
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase tracking-wide text-deep-teal/45">
              <tr>
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium" aria-label="View" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-deep-teal/5">
                  <td className="px-4 py-3 font-mono text-xs text-deep-teal">{order.orderId}</td>
                  <td className="px-4 py-3 text-deep-teal/70">{formatDate(order.date)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        order.reviewStatus === "rejected"
                          ? "bg-coral-blush text-deep-teal/70"
                          : "bg-pacific-teal/10 text-pacific-teal"
                      }`}
                    >
                      {order.reviewStatus === "rejected"
                        ? "Rejected"
                        : STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-deep-teal">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/portal/patient/orders/${order.id}`}
                      className="text-pacific-teal hover:text-deep-teal"
                      aria-label={`View ${order.orderId}`}
                    >
                      →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
