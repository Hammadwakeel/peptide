"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BRAND_COLORS,
  BRAND_RGBA,
  CHART_AXIS_STROKE,
  CHART_GRID_STROKE,
  CHART_TICK_FILL,
} from "@/lib/brand/colors";
import { formatCurrency } from "@/lib/format/currency";
import type { ProviderTrendPoint } from "@/lib/provider/compute-metrics";

type ProviderPerformanceChartProps = {
  data: ProviderTrendPoint[];
};

type ChartPoint = ProviderTrendPoint & {
  cumulativeSales: number;
  cumulativeProfit: number;
  cumulativeOrders: number;
};

type SeriesKey = "cumulativeSales" | "cumulativeProfit" | "cumulativeOrders";

const SERIES = [
  {
    key: "cumulativeSales" as const,
    label: "Total sales",
    color: BRAND_COLORS.pacificTeal,
    width: 3,
    yAxis: "currency" as const,
  },
  {
    key: "cumulativeProfit" as const,
    label: "Total profit",
    color: BRAND_RGBA.pacificTeal65,
    width: 2,
    yAxis: "currency" as const,
  },
  {
    key: "cumulativeOrders" as const,
    label: "Order volume",
    color: "rgba(1, 26, 36, 0.28)",
    width: 1.75,
    yAxis: "count" as const,
  },
];

function formatAxisDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildChartPoints(data: ProviderTrendPoint[]): ChartPoint[] {
  let cumulativeSales = 0;
  let cumulativeProfit = 0;
  let cumulativeOrders = 0;

  return data.map((point) => {
    cumulativeSales += point.revenue;
    cumulativeProfit += point.profit;
    cumulativeOrders += point.orders;

    return {
      ...point,
      cumulativeSales,
      cumulativeProfit,
      cumulativeOrders,
    };
  });
}

function PerformanceTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;

  return (
    <div className="rounded-xl border border-deep-teal/10 bg-pure-white px-4 py-3 shadow-[0_8px_24px_rgba(1,26,36,0.1)]">
      <p className="text-xs font-medium text-deep-teal/50">{formatAxisDate(String(label))}</p>
      <ul className="mt-2 space-y-1.5">
        {payload.map((entry) => {
          const series = SERIES.find((item) => item.key === entry.dataKey);
          if (!series) return null;
          const formatted =
            series.yAxis === "count"
              ? entry.value.toLocaleString()
              : formatCurrency(entry.value);
          return (
            <li key={entry.dataKey} className="flex items-center gap-2 text-sm text-deep-teal">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-deep-teal/60">{series.label}</span>
              <span className="ml-auto font-semibold tabular-nums">{formatted}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ProviderPerformanceChart({ data }: ProviderPerformanceChartProps) {
  const [focusedSeries, setFocusedSeries] = useState<SeriesKey | null>(null);

  const chartData = useMemo(() => buildChartPoints(data), [data]);

  const hasData = useMemo(
    () => chartData.some((point) => point.cumulativeSales > 0 || point.cumulativeOrders > 0),
    [chartData],
  );

  if (!hasData) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-deep-teal/10 bg-surface-muted/20 text-sm text-deep-teal/50">
        No paid orders in this date range yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-5 gap-y-2 px-2 sm:px-0">
        {SERIES.map((series) => {
          const active = !focusedSeries || focusedSeries === series.key;
          return (
            <button
              key={series.key}
              type="button"
              onClick={() =>
                setFocusedSeries((current) => (current === series.key ? null : series.key))
              }
              className={`inline-flex items-center gap-2 text-xs font-medium transition-opacity ${
                active ? "opacity-100" : "opacity-40"
              }`}
            >
              <span
                className="block w-5 rounded-full"
                style={{ backgroundColor: series.color, height: series.width }}
              />
              <span className="text-deep-teal/70">{series.label}</span>
            </button>
          );
        })}
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="4 6" stroke={CHART_GRID_STROKE} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatAxisDate}
              tick={{ fill: CHART_TICK_FILL, fontSize: 11, fontFamily: "inherit" }}
              axisLine={false}
              tickLine={false}
              minTickGap={28}
              dy={8}
            />
            <YAxis
              yAxisId="currency"
              tickFormatter={(value) =>
                `$${value >= 1000 ? `${Math.round(value / 1000)}k` : value}`
              }
              tick={{ fill: CHART_TICK_FILL, fontSize: 11, fontFamily: "inherit" }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <YAxis
              yAxisId="count"
              orientation="right"
              tick={{ fill: CHART_TICK_FILL, fontSize: 11, fontFamily: "inherit" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip content={<PerformanceTooltip />} cursor={{ stroke: CHART_AXIS_STROKE }} />
            {SERIES.map((series) => {
              const dimmed = focusedSeries && focusedSeries !== series.key;
              return (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  yAxisId={series.yAxis === "count" ? "count" : "currency"}
                  stroke={series.color}
                  strokeWidth={dimmed ? 1.25 : series.width}
                  strokeOpacity={dimmed ? 0.25 : 1}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: series.color,
                    stroke: BRAND_COLORS.pureWhite,
                    strokeWidth: 2,
                  }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
