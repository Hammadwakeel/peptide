"use client";

import { useState } from "react";
import { PayNowFlow } from "@/components/portal/patient/PayNowFlow";
import { usePatientPortal } from "@/context/PatientPortalProvider";
import { CLINIC_BRANDING } from "@/lib/patient-portal/mock-data";
import type { PatientPendingOrder } from "@/lib/patient-portal/types";
import { toast } from "@/lib/toast";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PendingPaymentsTab() {
  const { profile, pendingOrders, removePendingOrder, markOrderPaid } = usePatientPortal();
  const [payOrder, setPayOrder] = useState<PatientPendingOrder | null>(null);

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
              {pendingOrders.length} pending
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-deep-teal/65">{CLINIC_BRANDING.tagline}</p>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-deep-teal/15 px-6 py-16 text-center">
          <p className="font-serif text-xl font-light text-deep-teal">No pending payments</p>
          <p className="mt-2 text-sm text-deep-teal/55">You&apos;re all caught up.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingOrders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-deep-teal/45">{order.orderId}</p>
                  <p className="mt-1 text-sm text-deep-teal">
                    Prescribing Doctor: <span className="font-medium">{order.doctorName}</span>
                  </p>
                  <p className="mt-1 text-xs text-deep-teal/50">
                    {order.itemsCount} items · Ordered {formatDate(order.orderedOn)}
                  </p>
                </div>
                <span className="rounded-full bg-coral-blush px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-deep-teal/70">
                  Pending Payment
                </span>
              </div>

              <ul className="mt-4 space-y-2 border-y border-deep-teal/10 py-4 text-sm">
                {order.lineItems.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3 text-deep-teal/80">
                    <span>
                      {item.productName}
                      <span className="text-deep-teal/45"> ×{item.qty}</span>
                    </span>
                    <span>${item.price}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-base font-medium text-deep-teal">Total: ${order.total}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      removePendingOrder(order.id);
                      toast.success("Order removed.");
                    }}
                    className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal/60 hover:border-coral-blush hover:text-coral-blush"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayOrder(order)}
                    className="rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-pacific-teal"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {payOrder ? (
        <PayNowFlow
          order={payOrder}
          open={Boolean(payOrder)}
          onClose={() => setPayOrder(null)}
          onSuccess={() => {
            markOrderPaid(payOrder);
            toast.success("Payment complete.");
            setPayOrder(null);
          }}
        />
      ) : null}
    </div>
  );
}
