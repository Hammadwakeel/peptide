"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePatientPortal } from "@/context/PatientPortalProvider";

const STATUS_LABELS = {
  paid: "Paid",
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
  const { historyOrders } = usePatientPortal();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return historyOrders;
    return historyOrders.filter(
      (order) =>
        order.orderId.toLowerCase().includes(query) ||
        STATUS_LABELS[order.status].toLowerCase().includes(query),
    );
  }, [historyOrders, search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light text-deep-teal">Your Order History</h1>
          <p className="mt-1 text-sm text-deep-teal/55">{historyOrders.length} orders</p>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders…"
          className="w-full rounded-xl border border-deep-teal/15 px-3 py-2 text-sm outline-none focus:border-pacific-teal sm:max-w-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-deep-teal/15 px-6 py-16 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-deep-teal/25" aria-hidden="true">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.5" />
            <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 12h6M9 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="mt-4 font-medium text-deep-teal">No data found</p>
          <p className="mt-1 text-sm text-deep-teal/50">
            {historyOrders.length === 0
              ? "Your completed orders will appear here."
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
                    <span className="rounded-full bg-pacific-teal/10 px-2 py-0.5 text-xs font-medium text-pacific-teal">
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-deep-teal">${order.total}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/portal/patient/orders/${order.id}`} className="text-pacific-teal hover:text-deep-teal" aria-label={`View ${order.orderId}`}>
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
