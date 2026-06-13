"use client";

import { useMemo, useState } from "react";
import { isDateInRange, type AccountingTimeRange, type ReconciliationRow } from "@/lib/finance/types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AdminReconciliationReport() {
  const [range, setRange] = useState<AccountingTimeRange>("this_year");
  const [clinicFilter, setClinicFilter] = useState("all");

  const rows = useMemo<ReconciliationRow[]>(() => [], [range, clinicFilter]);

  const clinics = useMemo(
    () => Array.from(new Set(rows.map((row) => row.clinicName))).sort(),
    [rows],
  );

  const displaySummary = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          totalCollected: acc.totalCollected + row.collected,
          totalDisbursed: acc.totalDisbursed + row.disbursed,
          platformRevenue: acc.platformRevenue + row.netPlatform,
        }),
        { totalCollected: 0, totalDisbursed: 0, platformRevenue: 0 },
      ),
    [rows],
  );

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-deep-teal/10 bg-deep-teal/[0.02] px-4 py-4 sm:px-5">
        <h2 className="font-sans text-xl font-semibold text-deep-teal">Payment Reconciliation</h2>
        <p className="mt-1 text-sm text-deep-teal/60">
          Platform-wide collection, disbursement, and revenue reporting.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as AccountingTimeRange)}
          className="rounded-xl border border-deep-teal/15 px-3 py-2 text-sm"
        >
          <option value="this_month">This Month</option>
          <option value="last_3_months">Last 3 Months</option>
          <option value="this_year">This Year</option>
        </select>
        <select
          value={clinicFilter}
          onChange={(e) => setClinicFilter(e.target.value)}
          className="rounded-xl border border-deep-teal/15 px-3 py-2 text-sm"
        >
          <option value="all">All clinics</option>
          {clinics.map((clinic) => (
            <option key={clinic} value={clinic}>{clinic}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Collected", value: displaySummary.totalCollected },
          { label: "Total Disbursed", value: displaySummary.totalDisbursed },
          { label: "Platform Revenue", value: displaySummary.platformRevenue },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-deep-teal/10 bg-pure-white px-4 py-5 shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-deep-teal/45">{card.label}</p>
            <p className="mt-2 font-sans text-3xl font-semibold text-deep-teal">
              {formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase tracking-wide text-deep-teal/45">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Clinic</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Collected</th>
              <th className="px-4 py-3 font-medium">Disbursed</th>
              <th className="px-4 py-3 font-medium">Platform Fee</th>
              <th className="px-4 py-3 font-medium">Net Platform</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-deep-teal/5">
                <td className="px-4 py-3 text-deep-teal/70">{formatDate(row.date)}</td>
                <td className="px-4 py-3 text-deep-teal/70">{row.clinicName}</td>
                <td className="px-4 py-3 font-mono text-xs text-deep-teal">{row.orderId}</td>
                <td className="px-4 py-3 text-deep-teal">${row.collected}</td>
                <td className="px-4 py-3 text-deep-teal/70">${row.disbursed}</td>
                <td className="px-4 py-3 text-deep-teal/70">${row.platformFee}</td>
                <td className="px-4 py-3 font-medium text-pacific-teal">${row.netPlatform}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-deep-teal/50">No reconciliation rows in this range.</p>
        ) : null}
      </div>
    </div>
  );
}
