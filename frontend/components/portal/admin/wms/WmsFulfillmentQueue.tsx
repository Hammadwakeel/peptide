"use client";

import { useMemo, useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { WmsSubNav } from "@/components/portal/admin/wms/WmsSubNav";
import { useAdminOrders } from "@/context/OrdersProvider";
import { CARRIER_OPTIONS, type Carrier } from "@/lib/orders/types";
import { toast } from "@/lib/toast";

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 0;
  const paid = new Date(dateStr);
  const now = new Date("2026-03-06");
  return Math.max(0, Math.floor((now.getTime() - paid.getTime()) / (1000 * 60 * 60 * 24)));
}

function WmsUpdateTrackingModal({
  open,
  orderId,
  onClose,
}: {
  open: boolean;
  orderId: string;
  onClose: () => void;
}) {
  const { updateTracking } = useAdminOrders();
  const [carrier, setCarrier] = useState<Carrier>("FedEx");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippedDate, setShippedDate] = useState(new Date().toISOString().slice(0, 10));

  if (!open) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!trackingNumber.trim()) {
      toast.error("Enter a tracking number.");
      return;
    }
    updateTracking(orderId, { carrier, trackingNumber: trackingNumber.trim(), shippedDate });
    toast.success("Tracking updated.");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-teal/40 p-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-deep-teal/10 bg-pure-white p-6 shadow-xl">
        <h2 className="font-sans text-xl font-semibold text-deep-teal">Update tracking</h2>
        <p className="mt-1 font-mono text-xs text-deep-teal/45">{orderId}</p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="wms-tracking-carrier" className={authLabelClassName}>Carrier</label>
            <select id="wms-tracking-carrier" value={carrier} onChange={(e) => setCarrier(e.target.value as Carrier)} className={authInputClassName}>
              {CARRIER_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="wms-tracking-number" className={authLabelClassName}>Tracking number</label>
            <input id="wms-tracking-number" required value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className={authInputClassName} />
          </div>
          <div>
            <label htmlFor="wms-shipped-date" className={authLabelClassName}>Shipped date</label>
            <input id="wms-shipped-date" type="date" required value={shippedDate} onChange={(e) => setShippedDate(e.target.value)} className={authInputClassName} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal">Cancel</button>
            <button type="submit" className="rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-pacific-teal">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function WmsFulfillmentQueue() {
  const { allOrders } = useAdminOrders();
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  const queue = useMemo(
    () =>
      allOrders.filter(
        (order) =>
          order.paymentStatus === "paid" &&
          (order.shipmentStatus === "not_shipped" || order.shipmentStatus === "processing"),
      ),
    [allOrders],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-semibold text-deep-teal">Fulfillment Queue</h1>
        <p className="mt-1 text-sm text-deep-teal/55">{queue.length} paid orders awaiting shipment</p>
      </div>

      <WmsSubNav />

      <div className="overflow-x-auto rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase tracking-wide text-deep-teal/45">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Clinic</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Payment Date</th>
              <th className="px-4 py-3">Days Pending</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((order) => {
              const pendingDays = daysSince(order.paymentDate);
              return (
                <tr key={order.id} className={`border-b border-deep-teal/5 ${pendingDays >= 3 ? "bg-coral-blush/10" : ""}`}>
                  <td className="px-4 py-3 font-mono text-xs font-medium text-deep-teal">{order.id}</td>
                  <td className="px-4 py-3 text-deep-teal/70">{order.clinicName}</td>
                  <td className="px-4 py-3 text-deep-teal">{order.customerName ?? "—"}</td>
                  <td className="px-4 py-3 text-deep-teal/70">{order.itemsCount}</td>
                  <td className="px-4 py-3 text-deep-teal/70">{order.paymentDate ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={pendingDays >= 3 ? "font-medium text-coral-blush" : "text-deep-teal/70"}>
                      {pendingDays}d
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setTrackingOrderId(order.id)}
                      className="rounded-full bg-deep-teal px-3 py-1.5 text-xs font-medium text-pure-white hover:bg-pacific-teal"
                    >
                      Update Tracking
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {queue.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-deep-teal/50">No paid unshipped orders.</p>
        ) : null}
      </div>

      {trackingOrderId ? (
        <WmsUpdateTrackingModal
          open
          orderId={trackingOrderId}
          onClose={() => setTrackingOrderId(null)}
        />
      ) : null}
    </div>
  );
}
