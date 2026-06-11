"use client";

import {
  CartesianGrid,
  Legend,
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
import type { TrendPoint } from "@/lib/finance/types";

type RevenueProfitChartProps = {
  data: TrendPoint[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatAxisDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function RevenueProfitChart({ data }: RevenueProfitChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
          <XAxis
            dataKey="date"
            tickFormatter={formatAxisDate}
            tick={{ fill: CHART_TICK_FILL, fontSize: 11 }}
            axisLine={{ stroke: CHART_AXIS_STROKE }}
          />
          <YAxis
            tickFormatter={(value) => `$${value}`}
            tick={{ fill: CHART_TICK_FILL, fontSize: 11 }}
            axisLine={{ stroke: CHART_AXIS_STROKE }}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value ?? 0)), ""]}
            labelFormatter={(label) => formatAxisDate(String(label))}
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${CHART_AXIS_STROKE}`,
              background: BRAND_COLORS.pureWhite,
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke={BRAND_COLORS.pacificTeal}
            strokeWidth={2}
            dot={{ r: 3, fill: BRAND_COLORS.pacificTeal }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="profit"
            name="Profit"
            stroke={BRAND_RGBA.pacificTeal65}
            strokeWidth={2}
            dot={{ r: 3, fill: BRAND_RGBA.pacificTeal65 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
