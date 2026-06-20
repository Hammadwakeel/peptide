"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FrontierRefreshCwIcon, ICON_SIZE_SM } from "@/components/icons/frontier";
import { frontierBrandIcons } from "@/components/icons/frontier/frontier-brand-icons";
import { PortalPageSection } from "@/components/portal/shared/PortalPageSection";
import {
  PortalPageToolbar,
  toolbarBtnPrimaryClass,
} from "@/components/portal/shared/PortalPageToolbar";
import { usePatientPortal } from "@/context/PatientPortalProvider";
import { Tooltip } from "@/components/ui/Tippy";
import { fuseSearch } from "@/lib/search/fuse";
import { PATIENT_ORDER_HISTORY_KEYS } from "@/lib/search/keys";

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

  const filtered = useMemo(
    () => fuseSearch(historyOrders, search, PATIENT_ORDER_HISTORY_KEYS),
    [historyOrders, search],
  );

  return (
    <div className="space-y-5">
      <PortalPageToolbar title="Order History">
        <button
          type="button"
          onClick={() => void refreshOrders()}
          disabled={ordersLoading}
          className={toolbarBtnPrimaryClass}
          aria-label="Refresh orders"
        >
          <FrontierRefreshCwIcon size={ICON_SIZE_SM} className={ordersLoading ? "animate-spin" : ""} aria-hidden="true" />
        </button>
      </PortalPageToolbar>

      <PortalPageSection
        icon={frontierBrandIcons.package}
        title="Your orders"
        subtitle={
          ordersLoading
            ? "Loading…"
            : `${filtered.length} order${filtered.length === 1 ? "" : "s"}`
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

        {ordersLoading ? (
          <p className="px-4 py-10 text-center text-sm text-deep-teal/50">Loading orders…</p>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-deep-teal/50">
            {historyOrders.length === 0
              ? "Approved and completed orders will appear here."
              : "No orders match your search."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-deep-teal/10 bg-surface-muted/50 text-xs uppercase tracking-wide text-deep-teal/45">
                <tr>
                  <th className="px-4 py-3 font-light">Order ID</th>
                  <th className="px-4 py-3 font-light">Date</th>
                  <th className="px-4 py-3 font-light">Status</th>
                  <th className="px-4 py-3 font-light">Total</th>
                  <th className="px-4 py-3 font-light" aria-label="View" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-deep-teal/5">
                    <td className="px-4 py-3 font-mono text-xs text-deep-teal">{order.orderId}</td>
                    <td className="px-4 py-3 text-deep-teal/70">{formatDate(order.date)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-light ${
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
                      <Tooltip content={`View order ${order.orderId}`}>
                        <Link
                          href={`/portal/patient/orders/${order.id}`}
                          className="text-pacific-teal hover:text-deep-teal"
                          aria-label={`View ${order.orderId}`}
                        >
                          →
                        </Link>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PortalPageSection>
    </div>
  );
}
