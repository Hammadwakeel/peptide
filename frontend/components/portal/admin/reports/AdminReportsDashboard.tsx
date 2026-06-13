"use client";

import { formatCurrency } from "@/lib/format/currency";

const EMPTY_KPIS = {
  gmv: 0,
  activeClinics: 0,
  totalOrders: 0,
  platformRevenue: 0,
};

export function AdminReportsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-semibold text-deep-teal">Reports</h1>
        <p className="mt-1 text-sm text-deep-teal/55">Platform performance and revenue analytics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "GMV", value: formatCurrency(EMPTY_KPIS.gmv) },
          { label: "Active Clinics", value: EMPTY_KPIS.activeClinics.toString() },
          { label: "Total Orders", value: EMPTY_KPIS.totalOrders.toLocaleString() },
          { label: "Platform Revenue", value: formatCurrency(EMPTY_KPIS.platformRevenue) },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-deep-teal/10 bg-pure-white px-4 py-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-deep-teal/45">{kpi.label}</p>
            <p className="mt-2 font-sans text-3xl font-semibold text-deep-teal">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {[
          "Revenue vs Profit",
          "Channel Split",
          "Top Products",
          "Revenue by Region",
        ].map((title) => (
          <section
            key={title}
            className="flex min-h-64 flex-col rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm"
          >
            <h2 className="text-sm font-medium text-deep-teal">{title}</h2>
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-deep-teal/50">No report data available yet.</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
