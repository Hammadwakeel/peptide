"use client";

import { useProviderPortal } from "@/context/ProviderPortalProvider";
import { formatCurrency } from "@/lib/provider/mock-metrics";
import { METRICS_RANGE_LABELS, type MetricsDateRange } from "@/lib/provider/types";

const METRIC_ITEMS = [
  { key: "totalSales" as const, label: "Total Sales" },
  { key: "totalProfit" as const, label: "Total Profit" },
  { key: "avgOrderValue" as const, label: "Avg Order Value" },
  { key: "orderCount" as const, label: "Order Count" },
];

export function ProviderMetricsBar() {
  const { metricsRange, setMetricsRange, metrics } = useProviderPortal();

  return (
    <section
      aria-label="Provider performance metrics"
      className="rounded-2xl border border-deep-teal/10 bg-deep-teal/[0.03] p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          {METRIC_ITEMS.map(({ key, label }) => (
            <div key={key} className="rounded-xl border border-deep-teal/10 bg-pure-white px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-deep-teal/45">
                {label}
              </p>
              <p className="mt-1 font-serif text-xl font-light text-deep-teal">
                {key === "orderCount"
                  ? metrics.orderCount.toLocaleString()
                  : formatCurrency(metrics[key])}
              </p>
            </div>
          ))}
        </div>
        <div className="shrink-0">
          <label className="sr-only" htmlFor="metrics-range">
            Date range
          </label>
          <select
            id="metrics-range"
            value={metricsRange}
            onChange={(e) => setMetricsRange(e.target.value as MetricsDateRange)}
            className="w-full rounded-xl border border-deep-teal/15 bg-pure-white px-3 py-2 text-sm text-deep-teal outline-none focus:border-pacific-teal lg:w-auto"
          >
            {(Object.keys(METRICS_RANGE_LABELS) as MetricsDateRange[]).map((range) => (
              <option key={range} value={range}>
                {METRICS_RANGE_LABELS[range]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
