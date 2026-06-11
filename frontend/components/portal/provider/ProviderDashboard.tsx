"use client";

import Link from "next/link";
import { useCallback, useMemo } from "react";
import {
  LayoutGrid,
  MessageSquare,
  Package,
  RefreshCw,
  Store,
  Stethoscope,
  Users,
} from "lucide-react";
import { RoleOnboardingChecklist } from "@/components/onboarding/RoleOnboardingChecklist";
import { ProviderMetricsBar } from "@/components/portal/provider/ProviderMetricsBar";
import { ProviderPageSection } from "@/components/portal/provider/shared/ProviderPageSection";
import {
  ProviderPageToolbar,
  toolbarBtnClass,
  toolbarBtnPrimaryClass,
} from "@/components/portal/provider/shared/ProviderPageToolbar";
import { useAuth } from "@/context/AuthProvider";
import { useProviderUnreadTotal } from "@/context/ChatProvider";
import { useOrders } from "@/context/OrdersProvider";
import { usePatients } from "@/context/PatientsProvider";
import { useProviderPortal } from "@/context/ProviderPortalProvider";

function DetailCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border border-deep-teal/10 bg-surface-muted/40 px-3 py-2.5">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-deep-teal/45">{label}</dt>
      <dd className="mt-1 truncate text-sm font-medium text-deep-teal">{value}</dd>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-deep-teal/10 bg-pure-white px-4 py-3 text-center shadow-sm">
      <p className="text-[10px] font-medium uppercase tracking-wide text-deep-teal/45">{label}</p>
      <p className="mt-1 font-serif text-2xl font-light text-deep-teal">{value}</p>
    </div>
  );
}

const TOOLBAR_ACTIONS = [
  { href: "/portal/doctor/orders", label: "Orders", icon: Package, primary: true },
  { href: "/portal/doctor/customers", label: "Customers", icon: Users, primary: false },
  { href: "/portal/doctor/my-store", label: "My Store", icon: Store, primary: false },
  { href: "/portal/doctor/messages", label: "Messages", icon: MessageSquare, primary: false },
  { href: "/portal/doctor/inventory", label: "Inventory", icon: LayoutGrid, primary: false },
] as const;

export function ProviderDashboard() {
  const { session } = useAuth();
  const unreadMessages = useProviderUnreadTotal();
  const { orders, isLoading: ordersLoading, refreshOrders } = useOrders();
  const { patients, isLoading: patientsLoading, refreshPatients } = usePatients();
  const { branding, myStore, isStoreLoading, refreshMyStore } = useProviderPortal();

  const isLoading = ordersLoading || patientsLoading || isStoreLoading;

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

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refreshOrders({ force: true }),
      refreshPatients({ force: true }),
      refreshMyStore({ force: true }),
    ]);
  }, [refreshMyStore, refreshOrders, refreshPatients]);

  if (isLoading) {
    return <p className="py-12 text-center text-sm text-deep-teal/50">Loading your clinic workspace…</p>;
  }

  return (
    <div className="space-y-5">
      <RoleOnboardingChecklist role="doctor" />

      <ProviderPageToolbar title="Dashboard">
        {TOOLBAR_ACTIONS.map(({ href, label, icon: Icon, primary }) => (
          <Link
            key={href}
            href={href}
            className={`relative ${primary ? toolbarBtnPrimaryClass : toolbarBtnClass}`}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
            {href === "/portal/doctor/messages" && unreadMessages > 0 ? (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-coral-blush text-[10px] font-semibold text-deep-teal">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            ) : null}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={isLoading}
          className={toolbarBtnClass}
          aria-label="Refresh dashboard"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
        </button>
      </ProviderPageToolbar>

      <ProviderPageSection
        icon={Stethoscope}
        title={branding.clinicName}
        subtitle={session?.email ?? "—"}
      >
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailCell label="Clinic" value={branding.clinicName} />
          <DetailCell label="Account email" value={session?.email ?? "—"} />
          <DetailCell label="Store products" value={visibleStoreProducts} />
          <DetailCell label="Patients" value={patients.length} />
        </dl>
      </ProviderPageSection>

      <ProviderMetricsBar />

      <ProviderPageSection
        icon={Package}
        title="Operations"
        subtitle="Orders and patients at a glance"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCell label="Pending review" value={pendingReviewCount} />
          <StatCell label="Active shipments" value={activeShipments} />
          <StatCell label="Patients" value={patients.length} />
          <StatCell label="Store products" value={visibleStoreProducts} />
        </div>
      </ProviderPageSection>
    </div>
  );
}
