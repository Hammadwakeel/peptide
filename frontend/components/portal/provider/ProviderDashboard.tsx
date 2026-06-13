"use client";

import { useEffect, useMemo, useState } from "react";
import { Package, Stethoscope } from "lucide-react";
import { RoleOnboardingChecklist } from "@/components/onboarding/RoleOnboardingChecklist";
import { ProviderMetricsBar } from "@/components/portal/provider/ProviderMetricsBar";
import { ProviderPageSection } from "@/components/portal/provider/shared/ProviderPageSection";
import { ProviderPageToolbar } from "@/components/portal/provider/shared/ProviderPageToolbar";
import { useAuth } from "@/context/AuthProvider";
import { useOrders } from "@/context/OrdersProvider";
import { usePatients } from "@/context/PatientsProvider";
import { useProviderPortal } from "@/context/ProviderPortalProvider";
import { getClinicProfile } from "@/lib/doctor/api";

function DetailCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-lg border border-deep-teal/10 bg-surface-muted/40 px-2.5 py-2">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-deep-teal/45">{label}</dt>
      <dd className="mt-0.5 truncate text-xs font-medium text-deep-teal">{value}</dd>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-deep-teal/10 bg-pure-white px-3 py-2 text-center shadow-sm">
      <p className="text-[10px] font-medium uppercase tracking-wide text-deep-teal/45">{label}</p>
      <p className="mt-0.5 font-sans text-xl font-semibold leading-none text-deep-teal">{value}</p>
    </div>
  );
}

export function ProviderDashboard() {
  const { session } = useAuth();
  const { orders, isLoading: ordersLoading } = useOrders();
  const { patients, isLoading: patientsLoading } = usePatients();
  const { branding, myStore, isStoreLoading } = useProviderPortal();
  const [userName, setUserName] = useState<string | null>(null);

  const isLoading = ordersLoading || patientsLoading || isStoreLoading;

  useEffect(() => {
    let cancelled = false;

    void getClinicProfile()
      .then((profile) => {
        if (cancelled) return;
        const name = [profile.clinic.first_name, profile.clinic.last_name]
          .filter(Boolean)
          .join(" ")
          .trim();
        setUserName(name || null);
      })
      .catch(() => {
        if (!cancelled) setUserName(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = userName ?? session?.email ?? undefined;

  const pendingReviewCount = useMemo(
    () => orders.filter((order) => order.reviewStatus === "pending_review").length,
    [orders],
  );

  const activeShipments = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.reviewStatus === "approved" &&
          order.shipmentStatus !== "delivered" &&
          order.shipmentStatus !== "cancelled",
      ).length,
    [orders],
  );

  const visibleStoreProducts = useMemo(
    () => myStore.filter((product) => product.is_visible).length,
    [myStore],
  );

  if (isLoading) {
    return <p className="py-12 text-center text-sm text-deep-teal/50">Loading your clinic workspace…</p>;
  }

  return (
    <div className="space-y-5">
      <RoleOnboardingChecklist role="doctor" />

      <ProviderPageToolbar title="Dashboard" subtitle={displayName} />

      <div className="grid gap-5 lg:grid-cols-2">
        <ProviderPageSection
          icon={Stethoscope}
          title={branding.clinicName}
          subtitle={session?.email ?? "—"}
          compact
        >
          <dl className="grid grid-cols-2 gap-2">
            <DetailCell label="Clinic" value={branding.clinicName} />
            <DetailCell label="Account email" value={session?.email ?? "—"} />
            <DetailCell label="Store products" value={visibleStoreProducts} />
            <DetailCell label="Patients" value={patients.length} />
          </dl>
        </ProviderPageSection>

        <ProviderPageSection
          icon={Package}
          title="Operations"
          subtitle="Orders and patients at a glance"
          compact
        >
          <div className="grid grid-cols-2 gap-2">
            <StatCell label="Pending review" value={pendingReviewCount} />
            <StatCell label="Active shipments" value={activeShipments} />
            <StatCell label="Patients" value={patients.length} />
            <StatCell label="Store products" value={visibleStoreProducts} />
          </div>
        </ProviderPageSection>
      </div>

      <ProviderMetricsBar />
    </div>
  );
}
