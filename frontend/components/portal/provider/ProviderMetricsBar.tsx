"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProviderPageSection } from "@/components/portal/provider/shared/ProviderPageSection";
import { useOrders } from "@/context/OrdersProvider";
import { useProviderPortal } from "@/context/ProviderPortalProvider";
import { computeProviderTrend } from "@/lib/provider/compute-metrics";

const ProviderPerformanceChart = dynamic(
  () =>
    import("@/components/portal/provider/ProviderPerformanceChart").then(
      (mod) => mod.ProviderPerformanceChart,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-80 w-full min-w-0 rounded-xl" />,
  },
);

export function ProviderMetricsBar() {
  const { orders } = useOrders();
  const { metricsRange } = useProviderPortal();

  const trendData = useMemo(
    () => computeProviderTrend(orders, metricsRange),
    [orders, metricsRange],
  );

  return (
    <ProviderPageSection
      title="Performance"
      noPadding
      data-tour="doctor-dashboard-performance"
    >
      <div className="p-5 sm:p-6">
        <ProviderPerformanceChart data={trendData} />
      </div>
    </ProviderPageSection>
  );
}
