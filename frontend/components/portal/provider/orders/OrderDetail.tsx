"use client";

import Link from "next/link";
import { useState } from "react";
import { RefundModal } from "@/components/portal/provider/orders/RefundModal";
import { UpdateTrackingModal } from "@/components/portal/provider/orders/UpdateTrackingModal";
import { useOrders } from "@/context/OrdersProvider";
import { getPatientInitials } from "@/lib/patients/types";
import {
  PAYMENT_STATUS_LABELS,
  SHIPMENT_STATUS_LABELS,
} from "@/lib/orders/types";

type OrderDetailProps = {
  orderId: string;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const { getOrder } = useOrders();
  const order = getOrder(orderId);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);

  if (!order) {
    return (
      <div className="rounded-2xl border border-deep-teal/10 p-8 text-center">
        <p className="text-deep-teal">Order not found.</p>
        <Link href="/portal/doctor/orders" className="mt-4 inline-block text-sm text-pacific-teal hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link href="/portal/doctor/orders" className="inline-flex text-sm text-pacific-teal hover:underline">
        ← Back to Order Management
      </Link>

      <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-deep-teal/45">Order</p>
            <h2 className="mt-1 font-serif text-2xl font-light text-deep-teal">{order.id}</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-deep-teal/5 px-2.5 py-0.5 text-deep-teal/70">
                {PAYMENT_STATUS_LABELS[order.paymentStatus]}
              </span>
              <span className="rounded-full bg-deep-teal/5 px-2.5 py-0.5 text-deep-teal/70">
                {SHIPMENT_STATUS_LABELS[order.shipmentStatus]}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTrackingOpen(true)}
              className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-medium text-deep-teal hover:border-pacific-teal"
            >
              Update Tracking
            </button>
            <button
              type="button"
              onClick={() => setRefundOpen(true)}
              className="rounded-full border border-coral-blush px-4 py-2 text-sm font-medium text-deep-teal hover:bg-coral-blush/30"
            >
              Refund
            </button>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-deep-teal/45">Doctor</dt>
            <dd className="text-sm text-deep-teal">{order.doctorName}</dd>
          </div>
          <div>
            <dt className="text-xs text-deep-teal/45">Payment date</dt>
            <dd className="text-sm text-deep-teal">{formatDate(order.paymentDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-deep-teal/45">Total</dt>
            <dd className="text-sm font-medium text-deep-teal">${order.total}</dd>
          </div>
          <div>
            <dt className="text-xs text-deep-teal/45">Profit</dt>
            <dd className="text-sm font-medium text-pacific-teal">${order.profit}</dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
          <h3 className="text-sm font-medium text-deep-teal">Line items</h3>
          <div className="mt-4 overflow-x-auto rounded-xl border border-deep-teal/10">
            <table className="min-w-full text-sm">
              <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase text-deep-teal/45">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-left">SKU</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                  <th className="px-3 py-2 text-right">Price</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-deep-teal/5">
                    <td className="px-3 py-2 text-deep-teal">{item.productName}</td>
                    <td className="px-3 py-2 font-mono text-xs text-deep-teal/60">{item.sku}</td>
                    <td className="px-3 py-2 text-right text-deep-teal">{item.qty}</td>
                    <td className="px-3 py-2 text-right text-deep-teal">${item.unitPrice}</td>
                    <td className="px-3 py-2 text-right font-medium text-deep-teal">${item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {order.orderType === "customer" && order.customerName ? (
          <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-deep-teal">Patient info</h3>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-full bg-deep-teal/10 text-sm font-medium text-deep-teal">
                {getPatientInitials(order.customerName)}
              </span>
              <div>
                <p className="font-medium text-deep-teal">{order.customerName}</p>
                {order.patientEmail ? (
                  <p className="text-xs text-deep-teal/60">{order.patientEmail}</p>
                ) : null}
              </div>
            </div>
            {order.patientPhone ? (
              <p className="mt-3 text-sm text-deep-teal/70">{order.patientPhone}</p>
            ) : null}
            {order.customerId ? (
              <Link
                href={`/portal/doctor/customers/${order.customerId}`}
                className="mt-4 inline-block text-xs font-medium text-pacific-teal hover:underline"
              >
                View patient profile
              </Link>
            ) : null}
          </section>
        ) : null}
      </div>

      <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
        <h3 className="text-sm font-medium text-deep-teal">Shipment tracking</h3>
        {order.tracking ? (
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-deep-teal/45">Carrier</dt>
              <dd className="text-sm text-deep-teal">{order.tracking.carrier}</dd>
            </div>
            <div>
              <dt className="text-xs text-deep-teal/45">Tracking number</dt>
              <dd className="font-mono text-sm text-deep-teal">{order.tracking.trackingNumber}</dd>
            </div>
            <div>
              <dt className="text-xs text-deep-teal/45">Shipped</dt>
              <dd className="text-sm text-deep-teal">{formatDate(order.tracking.shippedDate)}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-deep-teal/50">No tracking information yet.</p>
        )}
        {order.tracking?.trackingUrl ? (
          <a
            href={order.tracking.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-medium text-pacific-teal hover:underline"
          >
            Track shipment →
          </a>
        ) : null}
      </section>

      <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
        <h3 className="text-sm font-medium text-deep-teal">Status timeline</h3>
        <ol className="mt-4 space-y-4 border-l border-deep-teal/15 pl-4">
          {order.timeline.map((entry) => (
            <li key={entry.id} className="relative">
              <span className="absolute -left-[1.35rem] top-1.5 size-2 rounded-full bg-pacific-teal" />
              <p className="text-sm font-medium text-deep-teal">{entry.status}</p>
              <p className="text-xs text-deep-teal/50">{formatDateTime(entry.date)}</p>
              <p className="mt-1 text-sm text-deep-teal/65">{entry.note}</p>
            </li>
          ))}
        </ol>
      </section>

      <UpdateTrackingModal open={trackingOpen} orderId={order.id} onClose={() => setTrackingOpen(false)} />
      <RefundModal open={refundOpen} orderId={order.id} orderTotal={order.total} onClose={() => setRefundOpen(false)} />
    </div>
  );
}
