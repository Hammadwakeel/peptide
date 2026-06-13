import type { Order } from "@/lib/orders/types";
import type { MetricsDateRange, ProviderMetrics } from "@/lib/provider/types";
import type { TrendPoint } from "@/lib/finance/types";

export type ProviderTrendPoint = TrendPoint & {
  orders: number;
};

function rangeStart(range: MetricsDateRange): Date {
  const now = new Date();
  if (range === "7d") return new Date(now.getTime() - 7 * 86_400_000);
  if (range === "30d") return new Date(now.getTime() - 30 * 86_400_000);
  if (range === "90d") return new Date(now.getTime() - 90 * 86_400_000);
  return new Date(now.getFullYear(), 0, 1);
}

function paidOrdersInRange(orders: Order[], range: MetricsDateRange) {
  const start = rangeStart(range);
  return orders.filter((order) => {
    if (!order.paymentDate) return false;
    return new Date(order.paymentDate) >= start;
  });
}

export function computeProviderMetrics(orders: Order[], range: MetricsDateRange): ProviderMetrics {
  const filtered = paidOrdersInRange(orders, range);

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

export function computeProviderTrend(orders: Order[], range: MetricsDateRange): ProviderTrendPoint[] {
  const start = rangeStart(range);
  const filtered = paidOrdersInRange(orders, range);
  const byDate = new Map<string, { revenue: number; profit: number; orders: number }>();

  for (const order of filtered) {
    const dateKey = order.paymentDate!.slice(0, 10);
    const existing = byDate.get(dateKey) ?? { revenue: 0, profit: 0, orders: 0 };
    existing.revenue += order.total;
    existing.profit += order.profit;
    existing.orders += 1;
    byDate.set(dateKey, existing);
  }

  const points: ProviderTrendPoint[] = [];
  const end = new Date();
  const cursor = new Date(start);

  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    const bucket = byDate.get(key) ?? { revenue: 0, profit: 0, orders: 0 };
    points.push({
      date: key,
      revenue: bucket.revenue,
      profit: bucket.profit,
      orders: bucket.orders,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return points;
}
