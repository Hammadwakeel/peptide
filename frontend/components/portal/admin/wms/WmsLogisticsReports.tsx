"use client";

import { WmsSubNav } from "@/components/portal/admin/wms/WmsSubNav";

export function WmsLogisticsReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-light text-deep-teal">Logistics Reports</h1>
        <p className="mt-1 text-sm text-deep-teal/55">Fulfillment performance and carrier analytics</p>
      </div>

      <WmsSubNav />

      <div className="grid gap-5 lg:grid-cols-2">
        {["Avg Fulfillment Time (30-day trend)", "Carrier Breakdown"].map((title) => (
          <section
            key={title}
            className="flex min-h-64 flex-col rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm"
          >
            <h2 className="text-sm font-medium text-deep-teal">{title}</h2>
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-deep-teal/50">No logistics data available yet.</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
