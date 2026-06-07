"use client";

import {
  Bar,
  BarChart,
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
  Legend,
} from "recharts";
import {
  CHANNEL_SPLIT,
  REPORTS_KPIS,
  REVENUE_BY_REGION,
  REVENUE_PROFIT_TREND,
  TOP_PRODUCTS_REPORT,
} from "@/lib/admin/mock-data";

const CHANNEL_COLORS = ["#0d717b", "#3a9aa3", "#8ec5c9"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function AdminReportsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-light text-deep-teal">Reports</h1>
        <p className="mt-1 text-sm text-deep-teal/55">Platform performance and revenue analytics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "GMV", value: formatCurrency(REPORTS_KPIS.gmv) },
          { label: "Active Clinics", value: REPORTS_KPIS.activeClinics.toString() },
          { label: "Total Orders", value: REPORTS_KPIS.totalOrders.toLocaleString() },
          { label: "Platform Revenue", value: formatCurrency(REPORTS_KPIS.platformRevenue) },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-deep-teal/10 bg-pure-white px-4 py-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-deep-teal/45">{kpi.label}</p>
            <p className="mt-2 font-serif text-3xl font-light text-deep-teal">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
          <h2 className="text-sm font-medium text-deep-teal">Revenue vs Profit</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REVENUE_PROFIT_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0d717b15" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${v / 1000}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#0d717b" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="profit" stroke="#3a9aa3" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
          <h2 className="text-sm font-medium text-deep-teal">Channel Split</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CHANNEL_SPLIT} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name} ${value}%`}>
                  {CHANNEL_SPLIT.map((_, i) => (
                    <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
          <h2 className="text-sm font-medium text-deep-teal">Top Products</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOP_PRODUCTS_REPORT} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#0d717b15" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
                <Bar dataKey="profit" fill="#0d717b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
          <h2 className="text-sm font-medium text-deep-teal">Revenue by Region</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-xs uppercase text-deep-teal/45">
                <tr><th className="py-2 text-left">Region</th><th className="py-2 text-right">Revenue</th><th className="py-2 text-right">Share</th></tr>
              </thead>
              <tbody>
                {REVENUE_BY_REGION.map((row) => (
                  <tr key={row.region} className="border-t border-deep-teal/5">
                    <td className="py-2 text-deep-teal">{row.region}</td>
                    <td className="py-2 text-right text-deep-teal">{formatCurrency(row.revenue)}</td>
                    <td className="py-2 text-right text-deep-teal/55">{Math.round((row.revenue / REPORTS_KPIS.gmv) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
