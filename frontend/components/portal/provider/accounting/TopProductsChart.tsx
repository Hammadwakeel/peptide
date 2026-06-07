"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProductProfitRow } from "@/lib/finance/types";
import { PROFIT_TIER_COLORS } from "@/lib/finance/types";

type TopProductsChartProps = {
  data: ProductProfitRow[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  const chartData = [...data]
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 8)
    .map((row) => ({
      ...row,
      shortName: row.productName.length > 28 ? `${row.productName.slice(0, 28)}…` : row.productName,
    }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#0d717b15" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(value) => `$${value}`}
            tick={{ fill: "#0d717b99", fontSize: 11 }}
            axisLine={{ stroke: "#0d717b22" }}
          />
          <YAxis
            type="category"
            dataKey="shortName"
            width={140}
            tick={{ fill: "#0d717b99", fontSize: 10 }}
            axisLine={{ stroke: "#0d717b22" }}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value ?? 0)), "Profit"]}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.productName ?? ""}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #0d717b22",
              background: "#fff",
            }}
          />
          <Bar dataKey="profit" radius={[0, 6, 6, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.productId} fill={PROFIT_TIER_COLORS[entry.tier]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
