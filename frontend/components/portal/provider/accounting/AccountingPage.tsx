"use client";

import { useMemo, useState } from "react";
import { FrontierDownloadIcon, ICON_SIZE_SM } from "@/components/icons/frontier";
import { frontierBrandIcons } from "@/components/icons/frontier/frontier-brand-icons";
import { RevenueProfitChart } from "@/components/portal/provider/accounting/RevenueProfitChart";
import { TopProductsChart } from "@/components/portal/provider/accounting/TopProductsChart";
import { ProviderPageSection } from "@/components/portal/provider/shared/ProviderPageSection";
import {
  ProviderPageToolbar,
  toolbarBtnClass,
} from "@/components/portal/provider/shared/ProviderPageToolbar";
import {
  paidOrdersToCsv,
  PAID_ORDER_STATUS_LABELS,
  PAYOUT_STATUS_LABELS,
  TIME_RANGE_LABELS,
  type AccountingTimeRange,
  type PaidOrderRow,
  type PayoutStatus,
  type ProductProfitRow,
  type ProviderPayout,
  type TrendPoint,
} from "@/lib/finance/types";
import { toast } from "@/lib/toast";

type SortKey = keyof Pick<
  PaidOrderRow,
  "orderId" | "date" | "product" | "customer" | "qty" | "basePrice" | "netProfit" | "total" | "status"
>;

function PayoutStatusPill({ status }: { status: PayoutStatus }) {
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

function PaidStatusPill({ status }: { status: PaidOrderRow["status"] }) {
  return (
    <span className="inline-flex rounded-full bg-pacific-teal/10 px-2 py-0.5 text-xs font-light text-pacific-teal">
      {PAID_ORDER_STATUS_LABELS[status]}
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

export function AccountingPage() {
  const [range, setRange] = useState<AccountingTimeRange>("this_month");
  const [customStart, setCustomStart] = useState("2026-01-01");
  const [customEnd, setCustomEnd] = useState("2026-03-06");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [breakdownId, setBreakdownId] = useState<string | null>(null);

  const trendData = useMemo<TrendPoint[]>(() => [], [range, customStart, customEnd]);

  const paidOrders = useMemo(() => {
    const list: PaidOrderRow[] = [];
    list.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortAsc ? av - bv : bv - av;
      }
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return list;
  }, [sortKey, sortAsc]);

  const topProducts = useMemo<ProductProfitRow[]>(() => [], []);

  const payouts = useMemo<ProviderPayout[]>(() => [], [range, customStart, customEnd]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((current) => !current);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function handleExport() {
    const csv = paidOrdersToCsv(paidOrders);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "paid-orders.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Paid orders exported.");
  }

  const breakdown = payouts.find((payout) => payout.id === breakdownId);

  return (
    <div className="space-y-5">
      <ProviderPageToolbar title="Accounting">
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as AccountingTimeRange)}
          className="rounded-full border border-deep-teal/25 bg-pure-white px-4 py-2 text-sm text-deep-teal outline-none focus:border-deep-teal"
        >
          {(Object.keys(TIME_RANGE_LABELS) as AccountingTimeRange[]).map((key) => (
            <option key={key} value={key}>
              {TIME_RANGE_LABELS[key]}
            </option>
          ))}
        </select>
        <button type="button" onClick={handleExport} className={toolbarBtnClass}>
          <FrontierDownloadIcon size={ICON_SIZE_SM} aria-hidden="true" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </ProviderPageToolbar>

      {range === "custom" ? (
        <div className="flex flex-wrap gap-3 rounded-2xl border border-deep-teal/20 bg-pure-white px-4 py-4 shadow-sm sm:px-5">
          <label className="text-sm text-deep-teal">
            <span className="mb-1 block text-xs text-deep-teal/45">Start</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-lg border border-deep-teal/15 px-3 py-2"
            />
          </label>
          <label className="text-sm text-deep-teal">
            <span className="mb-1 block text-xs text-deep-teal/45">End</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-lg border border-deep-teal/15 px-3 py-2"
            />
          </label>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <ProviderPageSection icon={frontierBrandIcons.pieChart} title="Revenue & profit trends">
          <RevenueProfitChart data={trendData} />
        </ProviderPageSection>
        <ProviderPageSection icon={frontierBrandIcons.dollarSign} title="Top products by profit">
          <TopProductsChart data={topProducts} />
        </ProviderPageSection>
      </div>

      <ProviderPageSection
        icon={frontierBrandIcons.dollarSign}
        title="Paid orders"
        subtitle={`${paidOrders.length} order${paidOrders.length === 1 ? "" : "s"}`}
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-deep-teal/10 bg-surface-muted/50 text-xs uppercase tracking-wide text-deep-teal/45">
              <tr>
                {(
                  [
                    ["orderId", "Order#"],
                    ["date", "Date"],
                    ["product", "Product"],
                    ["customer", "Customer"],
                    ["qty", "Qty"],
                    ["basePrice", "Base Price"],
                    ["netProfit", "Net Profit"],
                    ["total", "Total"],
                    ["status", "Status"],
                  ] as [SortKey, string][]
                ).map(([key, label]) => (
                  <th key={key} className="px-4 py-3 font-light">
                    <button type="button" onClick={() => handleSort(key)} className="hover:text-deep-teal">
                      {label}
                      {sortKey === key ? (sortAsc ? " ↑" : " ↓") : ""}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paidOrders.map((row) => (
                <tr key={row.id} className="border-b border-deep-teal/5">
                  <td className="px-4 py-3 font-mono text-xs text-deep-teal">{row.orderId}</td>
                  <td className="px-4 py-3 text-deep-teal/70">{formatDate(row.date)}</td>
                  <td className="px-4 py-3 text-deep-teal">{row.product}</td>
                  <td className="px-4 py-3 text-deep-teal/70">{row.customer}</td>
                  <td className="px-4 py-3 text-deep-teal">{row.qty}</td>
                  <td className="px-4 py-3 text-deep-teal/70">${row.basePrice}</td>
                  <td className="px-4 py-3 font-light text-pacific-teal">${row.netProfit}</td>
                  <td className="px-4 py-3 text-deep-teal">${row.total}</td>
                  <td className="px-4 py-3"><PaidStatusPill status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {paidOrders.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-deep-teal/50">No paid orders in this range.</p>
          ) : null}
        </div>
      </ProviderPageSection>

      <ProviderPageSection
        icon={frontierBrandIcons.wallet}
        title="Provider payouts"
        subtitle={`${payouts.length} payout${payouts.length === 1 ? "" : "s"}`}
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-deep-teal/10 bg-surface-muted/50 text-xs uppercase tracking-wide text-deep-teal/45">
              <tr>
                <th className="px-4 py-3 font-light">Batch ID</th>
                <th className="px-4 py-3 font-light">Date</th>
                <th className="px-4 py-3 font-light">Amount</th>
                <th className="px-4 py-3 font-light">Status</th>
                <th className="px-4 py-3 font-light">Breakdown</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id} className="border-b border-deep-teal/5">
                  <td className="px-4 py-3 font-mono text-xs text-deep-teal">{payout.batchId}</td>
                  <td className="px-4 py-3 text-deep-teal/70">{formatDate(payout.date)}</td>
                  <td className="px-4 py-3 font-light text-deep-teal">${payout.amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><PayoutStatusPill status={payout.status} /></td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setBreakdownId(payout.id)}
                      className="text-xs font-light text-pacific-teal hover:underline"
                    >
                      View breakdown
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payouts.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-deep-teal/50">No payouts in this range.</p>
          ) : null}
        </div>
      </ProviderPageSection>

      {breakdown ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-teal/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-deep-teal/10 bg-pure-white p-6 shadow-xl">
            <h3 className="font-sans text-xl font-light text-deep-teal">Payout breakdown</h3>
            <p className="mt-1 font-mono text-xs text-deep-teal/50">{breakdown.batchId}</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-deep-teal/60">Orders included</dt>
                <dd className="text-deep-teal">{breakdown.orderCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-deep-teal/60">Gross payout</dt>
                <dd className="font-light text-deep-teal">${breakdown.amount.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-deep-teal/60">Platform fees</dt>
                <dd className="text-deep-teal">${Math.round(breakdown.amount * 0.1).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between border-t border-deep-teal/10 pt-2">
                <dt className="font-light text-deep-teal">Net to clinic</dt>
                <dd className="font-light text-pacific-teal">
                  ${Math.round(breakdown.amount * 0.9).toLocaleString()}
                </dd>
              </div>
            </dl>
            {breakdown.error ? (
              <p className="mt-4 rounded-xl bg-coral-blush/40 px-3 py-2 text-xs text-deep-teal">{breakdown.error}</p>
            ) : null}
            <button
              type="button"
              onClick={() => setBreakdownId(null)}
              className="mt-5 rounded-full bg-deep-teal px-4 py-2 text-sm font-light text-pure-white"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
