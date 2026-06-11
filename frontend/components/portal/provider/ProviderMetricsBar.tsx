"use client";

import { BarChart3 } from "lucide-react";
import { Tooltip } from "@/components/ui/Tippy";
import { useProviderPortal } from "@/context/ProviderPortalProvider";
import { formatCurrency } from "@/lib/format/currency";
import { METRICS_RANGE_LABELS, type MetricsDateRange } from "@/lib/provider/types";

const METRIC_ITEMS = [
  { key: "totalSales" as const, label: "Total Sales", tip: "Gross sales revenue for the selected period." },
  { key: "totalProfit" as const, label: "Total Profit", tip: "Net profit after clinic product costs." },
  { key: "avgOrderValue" as const, label: "Avg Order Value", tip: "Average revenue per completed order." },
  { key: "orderCount" as const, label: "Order Count", tip: "Number of orders in the selected period." },
];

export function ProviderMetricsBar() {
  const { metricsRange, setMetricsRange, metrics } = useProviderPortal();

  return (
    <section
      aria-label="Provider performance metrics"
      className="overflow-hidden rounded-2xl border border-deep-teal/25 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.12)]"
    >
      <div className="bg-deep-teal px-5 py-4 text-pure-white">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-pure-white/15"
              aria-hidden="true"
            >
              <BarChart3 className="size-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-light">Performance</h2>
              <p className="text-xs text-pure-white/75">{METRICS_RANGE_LABELS[metricsRange]}</p>
            </div>
          </div>
          <div className="shrink-0">
            <label className="sr-only" htmlFor="metrics-range">
              Date range
            </label>
            <select
              id="metrics-range"
              value={metricsRange}
              onChange={(e) => setMetricsRange(e.target.value as MetricsDateRange)}
              className="w-full rounded-full border border-pure-white/20 bg-pure-white/10 px-4 py-2 text-sm text-pure-white outline-none focus:border-pure-white/40 sm:w-auto"
            >
              {(Object.keys(METRICS_RANGE_LABELS) as MetricsDateRange[]).map((range) => (
                <option key={range} value={range} className="text-deep-teal">
                  {METRICS_RANGE_LABELS[range]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {METRIC_ITEMS.map(({ key, label, tip }) => (
          <div
            key={key}
            className="rounded-xl border border-deep-teal/10 bg-pure-white px-4 py-3 text-center shadow-sm"
          >
            <Tooltip content={tip}>
              <p className="mx-auto w-fit cursor-help text-[10px] font-medium uppercase tracking-wide text-deep-teal/45 underline decoration-dotted decoration-deep-teal/25 underline-offset-2">
                {label}
              </p>
            </Tooltip>
            <p className="mt-1 font-serif text-2xl font-light text-deep-teal">
              {key === "orderCount"
                ? metrics.orderCount.toLocaleString()
                : formatCurrency(metrics[key])}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
