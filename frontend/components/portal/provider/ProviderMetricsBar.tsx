"use client";

import { useMemo } from "react";
import { frontierBrandIcons } from "@/components/icons/frontier/frontier-brand-icons";
import { ProviderPerformanceChart } from "@/components/portal/provider/ProviderPerformanceChart";
import { ProviderPageSection } from "@/components/portal/provider/shared/ProviderPageSection";
import { useOrders } from "@/context/OrdersProvider";
import { useProviderPortal } from "@/context/ProviderPortalProvider";
import { computeProviderTrend } from "@/lib/provider/compute-metrics";

export function ProviderMetricsBar() {
  const { orders } = useOrders();
  const { metricsRange } = useProviderPortal();

  const trendData = useMemo(
    () => computeProviderTrend(orders, metricsRange),
    [orders, metricsRange],
  );

  return (
    <ProviderPageSection icon={frontierBrandIcons.pieChart} title="Performance" noPadding>
      <div className="p-5 sm:p-6">
        <ProviderPerformanceChart data={trendData} />
      </div>
    </ProviderPageSection>
  );
}
