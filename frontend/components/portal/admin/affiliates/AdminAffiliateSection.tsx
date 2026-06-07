"use client";

import { useMemo, useState } from "react";
import { AFFILIATE_SUMMARY, MOCK_AFFILIATES } from "@/lib/admin/affiliate/mock-data";
import { AFFILIATE_STATUS_LABELS, type AffiliateStatus } from "@/lib/admin/affiliate/types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function StatusPill({ status }: { status: AffiliateStatus }) {
  const styles: Record<AffiliateStatus, string> = {
    active: "bg-pacific-teal/10 text-pacific-teal",
    paused: "bg-deep-teal/5 text-deep-teal/60",
    pending: "bg-coral-blush text-deep-teal/70",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {AFFILIATE_STATUS_LABELS[status]}
    </span>
  );
}

export function AdminAffiliateSection() {
  const [search, setSearch] = useState("");

  const affiliates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MOCK_AFFILIATES;
    return MOCK_AFFILIATES.filter((affiliate) => affiliate.name.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-light text-deep-teal">Affiliates</h1>
        <p className="mt-1 text-sm text-deep-teal/55">Partner attribution and commission overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active Affiliates", value: AFFILIATE_SUMMARY.activeAffiliates.toString() },
          { label: "Total GMV Attributed", value: formatCurrency(AFFILIATE_SUMMARY.totalGmvAttributed) },
          { label: "Commissions Paid", value: formatCurrency(AFFILIATE_SUMMARY.commissionsPaid) },
          { label: "Commissions Pending", value: formatCurrency(AFFILIATE_SUMMARY.commissionsPending) },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-deep-teal/10 bg-pure-white px-4 py-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-deep-teal/45">{kpi.label}</p>
            <p className="mt-2 font-serif text-3xl font-light text-deep-teal">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-medium text-deep-teal">Affiliate attribution</h2>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search affiliates…"
          className="w-full rounded-xl border border-deep-teal/15 px-3 py-2 text-sm sm:max-w-xs"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase tracking-wide text-deep-teal/45">
            <tr>
              <th className="px-4 py-3">Affiliate Name</th>
              <th className="px-4 py-3">Clinics Referred</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">GMV</th>
              <th className="px-4 py-3">Commission Rate</th>
              <th className="px-4 py-3">Earned</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {affiliates.map((affiliate) => (
              <tr key={affiliate.id} className="border-b border-deep-teal/5">
                <td className="px-4 py-3 font-medium text-deep-teal">{affiliate.name}</td>
                <td className="px-4 py-3 text-deep-teal/70">{affiliate.clinicsReferred}</td>
                <td className="px-4 py-3 text-deep-teal/70">{affiliate.orders}</td>
                <td className="px-4 py-3 text-deep-teal">{formatCurrency(affiliate.gmv)}</td>
                <td className="px-4 py-3 text-deep-teal/70">{affiliate.commissionRate}%</td>
                <td className="px-4 py-3 font-medium text-pacific-teal">{formatCurrency(affiliate.earned)}</td>
                <td className="px-4 py-3"><StatusPill status={affiliate.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
