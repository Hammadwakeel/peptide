"use client";

import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { WmsSubNav } from "@/components/portal/admin/wms/WmsSubNav";
import {
  CARRIER_BREAKDOWN,
  FULFILLMENT_TREND_30D,
  RETURN_RATE_PERCENT,
} from "@/lib/wms/mock-data";

const CARRIER_COLORS = ["#0d717b", "#3a9aa3", "#8ec5c9", "#c4dfe1"];

export function WmsLogisticsReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-light text-deep-teal">Logistics Reports</h1>
        <p className="mt-1 text-sm text-deep-teal/55">Fulfillment performance and carrier analytics</p>
      </div>

      <WmsSubNav />

      <div className="rounded-2xl border border-deep-teal/10 bg-pure-white px-4 py-5 shadow-sm sm:max-w-xs">
        <p className="text-xs uppercase tracking-wide text-deep-teal/45">Return Rate (30d)</p>
        <p className="mt-2 font-serif text-3xl font-light text-deep-teal">{RETURN_RATE_PERCENT}%</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
          <h2 className="text-sm font-medium text-deep-teal">Avg Fulfillment Time (30-day trend)</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={FULFILLMENT_TREND_30D}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0d717b15" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${v}d`} tick={{ fontSize: 11 }} domain={[0, "auto"]} />
                <Tooltip formatter={(v) => [`${v} days`, "Avg fulfillment"]} />
                <Line type="monotone" dataKey="avgDays" stroke="#0d717b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
          <h2 className="text-sm font-medium text-deep-teal">Carrier Breakdown</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CARRIER_BREAKDOWN}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {CARRIER_BREAKDOWN.map((_, i) => (
                    <Cell key={i} fill={CARRIER_COLORS[i % CARRIER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
