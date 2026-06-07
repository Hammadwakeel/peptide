import type { MetricsDateRange, ProviderMetrics } from "@/lib/provider/types";

const METRICS_BY_RANGE: Record<MetricsDateRange, ProviderMetrics> = {
  "7d": {
    totalSales: 4820,
    totalProfit: 1264,
    avgOrderValue: 241,
    orderCount: 20,
  },
  "30d": {
    totalSales: 21840,
    totalProfit: 5920,
    avgOrderValue: 228,
    orderCount: 96,
  },
  "90d": {
    totalSales: 62450,
    totalProfit: 16820,
    avgOrderValue: 235,
    orderCount: 266,
  },
  ytd: {
    totalSales: 89420,
    totalProfit: 24180,
    avgOrderValue: 231,
    orderCount: 387,
  },
};

export function getProviderMetrics(range: MetricsDateRange): ProviderMetrics {
  return METRICS_BY_RANGE[range];
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
