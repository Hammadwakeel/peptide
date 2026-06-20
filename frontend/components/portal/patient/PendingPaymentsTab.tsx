"use client";

import Link from "next/link";
import { FrontierRefreshCwIcon, ICON_SIZE_SM } from "@/components/icons/frontier";
import { frontierBrandIcons } from "@/components/icons/frontier/frontier-brand-icons";
import { frontierSidebarIcons } from "@/components/icons/frontier/frontier-sidebar-icons";
import { RoleOnboardingChecklist } from "@/components/onboarding/RoleOnboardingChecklist";
import { PortalPageSection } from "@/components/portal/shared/PortalPageSection";
import {
  PortalPageToolbar,
  toolbarBtnPrimaryClass,
} from "@/components/portal/shared/PortalPageToolbar";
import { usePatientPortal } from "@/context/PatientPortalProvider";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PendingPaymentsTab() {
  const { profile, pendingOrders, ordersLoading, clinicName } = usePatientPortal();
  const firstName = profile.name.split(" ")[0];

  return (
    <div className="space-y-5">
      <RoleOnboardingChecklist role="patient" />

      <PortalPageToolbar title={`Welcome, ${firstName}`}>
        <Link href="/portal/patient/products" className={toolbarBtnPrimaryClass}>
          <frontierSidebarIcons.shoppingBag size={ICON_SIZE_SM} aria-hidden="true" />
          <span className="hidden sm:inline">Browse products</span>
        </Link>
      </PortalPageToolbar>

      <PortalPageSection
        icon={frontierBrandIcons.wallet}
        title="Pending review"
        subtitle={
          ordersLoading
            ? "Loading…"
            : clinicName
              ? `${pendingOrders.length} order${pendingOrders.length === 1 ? "" : "s"} · ${clinicName}`
              : `${pendingOrders.length} order${pendingOrders.length === 1 ? "" : "s"} awaiting approval`
        }
      >
        {ordersLoading ? (
          <p className="py-12 text-center text-sm text-deep-teal/50">Loading orders…</p>
        ) : pendingOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-deep-teal/15 px-6 py-16 text-center">
            <p className="font-sans text-xl font-light text-deep-teal">No orders pending review</p>
            <Link
              href="/portal/patient/products"
              className="mt-6 inline-flex rounded-full bg-deep-teal px-5 py-2.5 text-sm font-light text-pure-white hover:bg-pacific-teal"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <article key={order.id} className="rounded-xl border border-deep-teal/10 bg-surface-muted/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-deep-teal/45">{order.orderId}</p>
                    <p className="mt-1 text-sm text-deep-teal">
                      Physician: <span className="font-light">{order.doctorName}</span>
                    </p>
                    <p className="mt-1 text-xs text-deep-teal/50">
                      {order.itemsCount} items · Ordered {formatDate(order.orderedOn)}
                    </p>
                  </div>
                  <span className="rounded-full bg-coral-blush px-2.5 py-0.5 text-xs font-light uppercase tracking-wide text-deep-teal/70">
                    Awaiting approval
                  </span>
                </div>

                <ul className="mt-4 space-y-2 border-y border-deep-teal/10 py-4 text-sm">
                  {order.lineItems.map((item) => (
                    <li key={item.id} className="flex justify-between gap-3 text-deep-teal/80">
                      <span>
                        {item.productName}
                        <span className="text-deep-teal/45"> ×{item.qty}</span>
                      </span>
                      <span>${item.price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-base font-light text-deep-teal">Total: ${order.total.toFixed(2)}</p>
                  <Link
                    href={`/portal/patient/orders/${order.id}`}
                    className="text-sm font-light text-pacific-teal hover:underline"
                  >
                    View details →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </PortalPageSection>
    </div>
  );
}
