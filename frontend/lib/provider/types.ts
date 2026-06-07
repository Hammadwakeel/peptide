export type MetricsDateRange = "7d" | "30d" | "90d" | "ytd";

export type ProviderMetrics = {
  totalSales: number;
  totalProfit: number;
  avgOrderValue: number;
  orderCount: number;
};

export type StorefrontBranding = {
  clinicName: string;
  tagline: string;
  themeColor: string;
  logoUrl: string | null;
};

export const METRICS_RANGE_LABELS: Record<MetricsDateRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  ytd: "Year to date",
};

export const DEFAULT_STOREFRONT_BRANDING: StorefrontBranding = {
  clinicName: "Frontier Wellness",
  tagline: "Verified peptides. Unconditional trust.",
  themeColor: "#0d717b",
  logoUrl: null,
};
