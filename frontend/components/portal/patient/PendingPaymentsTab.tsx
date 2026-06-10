"use client";

import Link from "next/link";
import { usePatientPortal } from "@/context/PatientPortalProvider";
import { CLINIC_BRANDING } from "@/lib/patient-portal/mock-data";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PendingPaymentsTab() {
  const { profile, pendingOrders, ordersLoading } = usePatientPortal();

  return (
    <div className="space-y-5">
      <div
        className="rounded-2xl px-5 py-6"
        style={{ backgroundColor: `${CLINIC_BRANDING.themeColor}12` }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-2xl font-light text-deep-teal">
            Welcome {profile.name.split(" ")[0]}
          </h1>
          {pendingOrders.length > 0 ? (
            <span className="rounded-full bg-coral-blush px-2.5 py-0.5 text-xs font-medium text-deep-teal/70">
              {pendingOrders.length} awaiting review
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-deep-teal/65">{CLINIC_BRANDING.tagline}</p>
      </div>

      {ordersLoading ? (
        <p className="py-12 text-center text-sm text-deep-teal/50">Loading orders…</p>
      ) : pendingOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-deep-teal/15 px-6 py-16 text-center">
          <p className="font-serif text-xl font-light text-deep-teal">No orders pending review</p>
          <p className="mt-2 text-sm text-deep-teal/55">
            Orders you place from Browse Products will appear here until your physician approves them.
          </p>
          <Link
            href="/portal/patient/products"
            className="mt-6 inline-flex rounded-full bg-deep-teal px-5 py-2.5 text-sm font-medium text-pure-white hover:bg-pacific-teal"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingOrders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-deep-teal/45">{order.orderId}</p>
                  <p className="mt-1 text-sm text-deep-teal">
                    Physician: <span className="font-medium">{order.doctorName}</span>
                  </p>
                  <p className="mt-1 text-xs text-deep-teal/50">
                    {order.itemsCount} items · Ordered {formatDate(order.orderedOn)}
                  </p>
                </div>
                <span className="rounded-full bg-coral-blush px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-deep-teal/70">
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
                <p className="text-base font-medium text-deep-teal">Total: ${order.total.toFixed(2)}</p>
                <Link
                  href={`/portal/patient/orders/${order.id}`}
                  className="text-sm font-medium text-pacific-teal hover:underline"
                >
                  View details →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
