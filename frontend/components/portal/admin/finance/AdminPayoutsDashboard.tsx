"use client";

import { useMemo, useState } from "react";
import {
  isDateInRange,
  PAYOUT_STATUS_LABELS,
  type AccountingTimeRange,
  type PayoutStatus,
  type ProviderPayout,
} from "@/lib/finance/types";
import { toast } from "@/lib/toast";

function StatusPill({ status }: { status: PayoutStatus }) {
  const styles: Record<PayoutStatus, string> = {
    paid: "bg-pacific-teal/10 text-pacific-teal",
    processing: "bg-coral-blush text-deep-teal/70",
    failed: "bg-coral-blush/60 text-deep-teal",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-light ${styles[status]}`}>
      {PAYOUT_STATUS_LABELS[status]}
    </span>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AdminPayoutsDashboard() {
  const [payouts, setPayouts] = useState<ProviderPayout[]>([]);
  const [clinicFilter, setClinicFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | PayoutStatus>("all");
  const [dateRange, setDateRange] = useState<AccountingTimeRange>("last_3_months");

  const clinics = useMemo(
    () => Array.from(new Set(payouts.map((payout) => payout.clinicName))).sort(),
    [payouts],
  );

  const filtered = useMemo(() => {
    return payouts.filter((payout) => {
      if (clinicFilter !== "all" && payout.clinicName !== clinicFilter) return false;
      if (statusFilter !== "all" && payout.status !== statusFilter) return false;
      return isDateInRange(payout.date, dateRange);
    });
  }, [payouts, clinicFilter, statusFilter, dateRange]);

  const errors = payouts.filter((payout) => payout.status === "failed" && payout.error);

  function handleManualTrigger(payout: ProviderPayout) {
    setPayouts((current) =>
      current.map((row) =>
        row.id === payout.id ? { ...row, status: "processing" as PayoutStatus, error: undefined } : row,
      ),
    );
    toast.success(`Manual payout triggered for ${payout.batchId}.`);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-deep-teal/10 bg-deep-teal/[0.02] px-4 py-4 sm:px-5">
        <h2 className="font-sans text-xl font-light text-deep-teal">Payouts Dashboard</h2>
        <p className="mt-1 text-sm text-deep-teal/60">
          All clinic payout batches with manual triggers and error monitoring.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-deep-teal/10 bg-pure-white p-4 shadow-sm">
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | PayoutStatus)}
          className="rounded-xl border border-deep-teal/15 px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          {(Object.keys(PAYOUT_STATUS_LABELS) as PayoutStatus[]).map((status) => (
            <option key={status} value={status}>{PAYOUT_STATUS_LABELS[status]}</option>
          ))}
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as AccountingTimeRange)}
          className="rounded-xl border border-deep-teal/15 px-3 py-2 text-sm"
        >
          <option value="today">Today</option>
          <option value="this_month">This Month</option>
          <option value="last_3_months">Last 3 Months</option>
          <option value="this_year">This Year</option>
        </select>
      </div>

      {errors.length > 0 ? (
        <section className="rounded-2xl border border-coral-blush bg-coral-blush/40 p-4">
          <h3 className="text-sm font-light text-deep-teal">Payout errors</h3>
          <ul className="mt-2 space-y-2">
            {errors.map((payout) => (
              <li key={payout.id} className="text-sm text-deep-teal/80">
                <span className="font-mono text-xs">{payout.batchId}</span> — {payout.clinicName}: {payout.error}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase tracking-wide text-deep-teal/45">
            <tr>
              <th className="px-4 py-3 font-light">Batch ID</th>
              <th className="px-4 py-3 font-light">Clinic</th>
              <th className="px-4 py-3 font-light">Date</th>
              <th className="px-4 py-3 font-light">Amount</th>
              <th className="px-4 py-3 font-light">Orders</th>
              <th className="px-4 py-3 font-light">Status</th>
              <th className="px-4 py-3 font-light">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((payout) => (
              <tr key={payout.id} className="border-b border-deep-teal/5">
                <td className="px-4 py-3 font-mono text-xs text-deep-teal">{payout.batchId}</td>
                <td className="px-4 py-3 text-deep-teal/70">{payout.clinicName}</td>
                <td className="px-4 py-3 text-deep-teal/70">{formatDate(payout.date)}</td>
                <td className="px-4 py-3 font-light text-deep-teal">${payout.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-deep-teal">{payout.orderCount}</td>
                <td className="px-4 py-3"><StatusPill status={payout.status} /></td>
                <td className="px-4 py-3">
                  {(payout.status === "failed" || payout.status === "processing") ? (
                    <button
                      type="button"
                      onClick={() => handleManualTrigger(payout)}
                      className="rounded-full border border-deep-teal/15 px-3 py-1 text-xs font-light text-deep-teal hover:bg-pacific-teal/12"
                    >
                      Manual Trigger
                    </button>
                  ) : (
                    <span className="text-xs text-deep-teal/40">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-deep-teal/50">No payouts match your filters.</p>
        ) : null}
      </div>
    </div>
  );
}
