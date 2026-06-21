"use client";

import { useEffect } from "react";
import { DoctorMissionPanel } from "@/components/onboarding/doctor/DoctorMissionPanel";
import { ProviderMetricsBar } from "@/components/portal/provider/ProviderMetricsBar";
import {
  ProviderDashboardClinicCardSkeleton,
  ProviderDashboardMetricsSkeleton,
  ProviderDashboardOpsCardSkeleton,
} from "@/components/portal/provider/ProviderDashboardSkeleton";
import { ProviderPageSection } from "@/components/portal/provider/shared/ProviderPageSection";
import { ProviderPageToolbar } from "@/components/portal/provider/shared/ProviderPageToolbar";
import { useAuth } from "@/context/AuthProvider";
import { useProviderDashboard } from "@/context/ProviderPortalProvider";
import { DOCTOR_ONBOARDING_EVENTS } from "@/lib/onboarding/doctor/events";

function DetailCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-lg border border-deep-teal/10 bg-surface-muted/40 px-2.5 py-2">
      <dt className="text-[10px] font-light uppercase tracking-wide text-deep-teal/45">{label}</dt>
      <dd className="mt-0.5 truncate text-xs font-light text-deep-teal">{value}</dd>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-deep-teal/10 bg-pure-white px-3 py-2 text-center shadow-sm">
      <p className="text-[10px] font-light uppercase tracking-wide text-deep-teal/45">{label}</p>
      <p className="mt-0.5 font-sans text-xl font-light leading-none text-deep-teal">{value}</p>
    </div>
  );
}

export function ProviderDashboard() {
  const { session } = useAuth();
  const {
    branding,
    providerDisplayName,
    stats,
    cardsReady,
    isOrdersHydrated,
    isPatientsHydrated,
    isStoreHydrated,
    isProfileHydrated,
  } = useProviderDashboard();

  const displayName = providerDisplayName ?? session?.email ?? undefined;

  useEffect(() => {
    if (!cardsReady) return;
    window.dispatchEvent(new CustomEvent(DOCTOR_ONBOARDING_EVENTS.dashboardReady));
  }, [cardsReady]);

  const showClinicCard = isProfileHydrated && isStoreHydrated && isPatientsHydrated;
  const showOpsCard = isOrdersHydrated && isPatientsHydrated && isStoreHydrated;

  return (
    <div className="space-y-5">
      <DoctorMissionPanel />

      <ProviderPageToolbar title="Dashboard" subtitle={displayName} />

      <div className="grid gap-5 lg:grid-cols-2">
        {showClinicCard ? (
          <ProviderPageSection
            title={branding.clinicName}
            subtitle={session?.email ?? "—"}
            compact
            data-tour="doctor-dashboard-clinic-card"
          >
            <dl className="grid grid-cols-2 gap-2">
              <DetailCell label="Clinic" value={branding.clinicName} />
              <DetailCell label="Account email" value={session?.email ?? "—"} />
              <DetailCell label="Store products" value={stats.visibleStoreProducts} />
              <DetailCell label="Patients" value={stats.patientCount} />
            </dl>
          </ProviderPageSection>
        ) : (
          <ProviderDashboardClinicCardSkeleton />
        )}

        {showOpsCard ? (
          <ProviderPageSection
            title="Operations"
            subtitle="Orders and patients at a glance"
            compact
            data-tour="doctor-dashboard-ops-card"
          >
            <div className="grid grid-cols-2 gap-2">
              <StatCell label="Pending review" value={stats.pendingReviewCount} />
              <StatCell label="Active shipments" value={stats.activeShipments} />
              <StatCell label="Patients" value={stats.patientCount} />
              <StatCell label="Store products" value={stats.visibleStoreProducts} />
            </div>
          </ProviderPageSection>
        ) : (
          <ProviderDashboardOpsCardSkeleton />
        )}
      </div>

      {isOrdersHydrated ? <ProviderMetricsBar /> : <ProviderDashboardMetricsSkeleton />}
    </div>
  );
}
