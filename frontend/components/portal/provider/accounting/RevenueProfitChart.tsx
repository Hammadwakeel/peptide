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
          <CartesianGrid strokeDasharray="3 3" stroke="#0d717b15" />
          <XAxis
            dataKey="date"
            tickFormatter={formatAxisDate}
            tick={{ fill: "#0d717b99", fontSize: 11 }}
            axisLine={{ stroke: "#0d717b22" }}
          />
          <YAxis
            tickFormatter={(value) => `$${value}`}
            tick={{ fill: "#0d717b99", fontSize: 11 }}
            axisLine={{ stroke: "#0d717b22" }}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value ?? 0)), ""]}
            labelFormatter={(label) => formatAxisDate(String(label))}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #0d717b22",
              background: "#fff",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#0d717b"
            strokeWidth={2}
            dot={{ r: 3, fill: "#0d717b" }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="profit"
            name="Profit"
            stroke="#3a9aa3"
            strokeWidth={2}
            dot={{ r: 3, fill: "#3a9aa3" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
