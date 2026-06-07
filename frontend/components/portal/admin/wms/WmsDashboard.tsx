"use client";

import Link from "next/link";
import { WMS_DASHBOARD_METRICS } from "@/lib/wms/mock-data";
import { WmsSubNav } from "@/components/portal/admin/wms/WmsSubNav";

function OnTimeGauge({ rate }: { rate: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (rate / 100) * circumference;

  return (
    <div className="relative mx-auto size-36">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r="54" fill="none" stroke="#0d717b15" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#0d717b"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-3xl font-light text-deep-teal">{rate}%</span>
        <span className="text-xs text-deep-teal/45">On-time</span>
      </div>
    </div>
  );
}

export function WmsDashboard() {
  const metrics = WMS_DASHBOARD_METRICS;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-light text-deep-teal">WMS Dashboard</h1>
        <p className="mt-1 text-sm text-deep-teal/55">Fulfillment operations overview</p>
      </div>

      <WmsSubNav />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-deep-teal/10 bg-pure-white px-4 py-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-deep-teal/45">Pending Shipments</p>
          <p className="mt-2 font-serif text-3xl font-light text-deep-teal">{metrics.pendingShipments}</p>
          <Link href="/portal/admin/wms/queue" className="mt-2 inline-block text-xs text-pacific-teal hover:underline">
            View queue →
          </Link>
        </div>
        <div className="rounded-2xl border border-deep-teal/10 bg-pure-white px-4 py-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-deep-teal/45">Avg Days to Ship</p>
          <p className="mt-2 font-serif text-3xl font-light text-deep-teal">{metrics.avgDaysToShip}</p>
        </div>
        <div className="rounded-2xl border border-deep-teal/10 bg-pure-white px-4 py-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-deep-teal/45">Late Orders</p>
          <p className="mt-2 font-serif text-3xl font-light text-coral-blush">{metrics.lateOrders}</p>
        </div>
        <div className="rounded-2xl border border-deep-teal/10 bg-pure-white px-4 py-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-deep-teal/45">On-Time Rate</p>
          <div className="mt-2">
            <OnTimeGauge rate={metrics.onTimeRate} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Fulfillment Queue", href: "/portal/admin/wms/queue", desc: "Paid orders awaiting shipment" },
          { label: "Bulk Tracking Import", href: "/portal/admin/wms/import", desc: "Upload carrier CSV updates" },
          { label: "Inventory Alerts", href: "/portal/admin/wms/inventory", desc: "Low and out-of-stock SKUs" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm transition-colors hover:border-pacific-teal/30"
          >
            <p className="font-medium text-deep-teal">{item.label}</p>
            <p className="mt-1 text-sm text-deep-teal/55">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
