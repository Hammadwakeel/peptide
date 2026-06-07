"use client";

import Link from "next/link";
import { usePatientPortal } from "@/context/PatientPortalProvider";
import { toast } from "@/lib/toast";

type PatientOrderDetailProps = {
  orderId: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function PatientOrderDetail({ orderId }: PatientOrderDetailProps) {
  const { getHistoryOrder } = usePatientPortal();
  const order = getHistoryOrder(orderId);

  if (!order) {
    return (
      <div className="rounded-2xl border border-deep-teal/10 p-8 text-center">
        <p className="text-deep-teal">Order not found.</p>
        <Link href="/portal/patient/orders" className="mt-4 inline-block text-sm text-pacific-teal hover:underline">
          Back to order history
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link href="/portal/patient/orders" className="inline-flex text-sm text-pacific-teal hover:underline">
        ← Back to Order History
      </Link>

      <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
        <h1 className="font-serif text-2xl font-light text-deep-teal">{order.orderId}</h1>
        <p className="mt-1 text-sm text-deep-teal/55">Placed {formatDate(order.date)}</p>

        <h2 className="mt-6 text-sm font-medium text-deep-teal">Items</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {order.lineItems.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 border-b border-deep-teal/5 pb-2 text-deep-teal/80">
              <span>{item.productName} ×{item.qty}</span>
              <span>${item.price}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between font-medium text-deep-teal">
          <span>Total</span>
          <span>${order.total}</span>
        </p>
      </section>

      <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
        <h2 className="text-sm font-medium text-deep-teal">Tracking</h2>
        {order.tracking ? (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-deep-teal/45">Carrier</dt>
              <dd className="text-sm text-deep-teal">{order.tracking.carrier}</dd>
            </div>
            <div>
              <dt className="text-xs text-deep-teal/45">Tracking number</dt>
              <dd className="font-mono text-sm text-deep-teal">{order.tracking.trackingNumber}</dd>
            </div>
            <div>
              <dt className="text-xs text-deep-teal/45">Estimated delivery</dt>
              <dd className="text-sm text-deep-teal">{formatDate(order.tracking.estimatedDelivery)}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-deep-teal/50">Tracking not available yet.</p>
        )}
        {order.tracking?.trackingUrl ? (
          <a
            href={order.tracking.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-pacific-teal"
          >
            Track shipment
          </a>
        ) : null}
      </section>

      {order.receiptUrl ? (
        <a
          href={order.receiptUrl}
          className="inline-flex text-sm font-medium text-pacific-teal hover:underline"
          onClick={(e) => {
            e.preventDefault();
            toast.success(`Receipt for ${order.orderId} downloaded.`);
          }}
        >
          Download receipt →
        </a>
      ) : null}
    </div>
  );
}
