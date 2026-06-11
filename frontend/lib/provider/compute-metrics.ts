import type { Order } from "@/lib/orders/types";
import type { MetricsDateRange, ProviderMetrics } from "@/lib/provider/types";

function rangeStart(range: MetricsDateRange): Date {
  const now = new Date();
  if (range === "7d") return new Date(now.getTime() - 7 * 86_400_000);
  if (range === "30d") return new Date(now.getTime() - 30 * 86_400_000);
  if (range === "90d") return new Date(now.getTime() - 90 * 86_400_000);
  return new Date(now.getFullYear(), 0, 1);
}

export function computeProviderMetrics(orders: Order[], range: MetricsDateRange): ProviderMetrics {
  const start = rangeStart(range);
  const filtered = orders.filter((order) => {
    if (!order.paymentDate) return false;
    return new Date(order.paymentDate) >= start;
  });

  const orderCount = filtered.length;
  const totalSales = filtered.reduce((sum, order) => sum + order.total, 0);
  const totalProfit = filtered.reduce((sum, order) => sum + order.profit, 0);

  return {
    totalSales,
    totalProfit,
    avgOrderValue: orderCount > 0 ? totalSales / orderCount : 0,
    orderCount,
  };
}
