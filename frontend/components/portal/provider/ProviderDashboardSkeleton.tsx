import { Skeleton } from "@/components/ui/Skeleton";
import { ProviderPageSection } from "@/components/portal/provider/shared/ProviderPageSection";

export function ProviderDashboardCardSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-deep-teal/10 bg-surface-muted/40 px-2.5 py-2"
        >
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="mt-2 h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function ProviderDashboardMetricsSkeleton() {
  return (
    <ProviderPageSection title="Performance" noPadding>
      <div className="p-5 sm:p-6">
        <Skeleton className="h-80 w-full min-w-0 rounded-xl" />
      </div>
    </ProviderPageSection>
  );
}

export function ProviderDashboardClinicCardSkeleton() {
  return (
    <ProviderPageSection
      title="Clinic"
      subtitle="Loading…"
      compact
    >
      <ProviderDashboardCardSkeleton />
    </ProviderPageSection>
  );
}

export function ProviderDashboardOpsCardSkeleton() {
  return (
    <ProviderPageSection
      title="Operations"
      subtitle="Orders and patients at a glance"
      compact
    >
      <ProviderDashboardCardSkeleton />
    </ProviderPageSection>
  );
}
