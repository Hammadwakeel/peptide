import { PROFIT_TIER_COLORS } from "@/lib/brand/colors";

export type AccountingTimeRange =
  | "today"
  | "this_month"
  | "last_3_months"
  | "this_year"
  | "custom";

export type PaidOrderRow = {
  id: string;
  orderId: string;
  date: string;
  product: string;
  customer: string;
  qty: number;
  basePrice: number;
  netProfit: number;
  total: number;
  status: "paid" | "refunded" | "partial_refund";
};

export type TrendPoint = {
  date: string;
  revenue: number;
  profit: number;
};

export type ProductProfitRow = {
  productId: string;
  productName: string;
  profit: number;
  tier: "high" | "medium" | "low";
};

export type PayoutStatus = "paid" | "processing" | "failed";

export type ProviderPayout = {
  id: string;
  batchId: string;
  date: string;
  amount: number;
  status: PayoutStatus;
  orderCount: number;
  clinicId: string;
  clinicName: string;
  error?: string;
};

export type ReconciliationRow = {
  id: string;
  date: string;
  clinicName: string;
  orderId: string;
  collected: number;
  disbursed: number;
  platformFee: number;
  netPlatform: number;
};

export type ReconciliationSummary = {
  totalCollected: number;
  totalDisbursed: number;
  platformRevenue: number;
};

export const TIME_RANGE_LABELS: Record<AccountingTimeRange, string> = {
  today: "Today",
  this_month: "This Month",
  last_3_months: "Last 3 Months",
  this_year: "This Year",
  custom: "Custom Range",
};

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  paid: "Paid",
  processing: "Processing",
  failed: "Failed",
};

export const PAID_ORDER_STATUS_LABELS: Record<PaidOrderRow["status"], string> = {
  paid: "Paid",
  refunded: "Refunded",
  partial_refund: "Partial Refund",
};

export { PROFIT_TIER_COLORS };

export function paidOrdersToCsv(rows: PaidOrderRow[]): string {
  const header = "Order#,Date,Product,Customer,Qty,Base Price,Net Profit,Total,Status";
  const lines = rows.map(
    (row) =>
      `${row.orderId},${row.date},"${row.product}","${row.customer}",${row.qty},${row.basePrice},${row.netProfit},${row.total},${row.status}`,
  );
  return [header, ...lines].join("\n");
}

export function isDateInRange(
  dateStr: string,
  range: AccountingTimeRange,
  customStart?: string,
  customEnd?: string,
): boolean {
  const date = new Date(dateStr);
  const now = new Date("2026-03-06");

  if (range === "today") {
    return date.toDateString() === now.toDateString();
  }

  if (range === "this_month") {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }

  if (range === "last_3_months") {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 3);
    return date >= start && date <= now;
  }

  if (range === "this_year") {
    return date.getFullYear() === now.getFullYear();
  }

  if (range === "custom" && customStart && customEnd) {
    const start = new Date(customStart);
    const end = new Date(customEnd);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  }

  return true;
}
