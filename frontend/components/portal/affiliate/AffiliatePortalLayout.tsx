"use client";

import Link from "next/link";
import { useMemo } from "react";
import { RoleOnboardingJoyride } from "@/components/onboarding/RoleOnboardingJoyride";
import { PortalSidebarLayout, type SidebarLink } from "@/components/portal/shared/PortalSidebarLayout";
import { PortalBootstrap } from "@/components/bootstrap/PortalBootstrap";
import { AffiliatePortalProvider, useAffiliatePortal } from "@/context/AffiliatePortalProvider";

const BASE_AFFILIATE_LINKS: SidebarLink[] = [
  { href: "/portal/affiliate", label: "Dashboard", exact: true },
  { href: "/portal/affiliate/clinics/invite", label: "Invite Clinic" },
  { href: "/portal/affiliate/referrals", label: "Clinic Referrals" },
];

const MAIN_AFFILIATE_LINKS: SidebarLink[] = [
  { href: "/portal/affiliate/sub-affiliates", label: "Sub-Affiliates" },
];

function AffiliatePortalShell({ children }: { children: React.ReactNode }) {
  const { isMain } = useAffiliatePortal();

  const links = useMemo(
    () => (isMain ? [...BASE_AFFILIATE_LINKS, ...MAIN_AFFILIATE_LINKS] : BASE_AFFILIATE_LINKS),
    [isMain],
  );

  return (
    <PortalSidebarLayout portalLabel="Affiliate portal" links={links}>
      <RoleOnboardingJoyride
        role="affiliate"
        filterStepIds={isMain ? undefined : ["sub-affiliates"]}
      />
      {children}
    </PortalSidebarLayout>
  );
}

export function AffiliatePortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AffiliatePortalProvider>
      <PortalBootstrap role="affiliate" />
      <AffiliatePortalShell>{children}</AffiliatePortalShell>
    </AffiliatePortalProvider>
  );
}

export function MainAffiliateOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isMain, isLoading } = useAffiliatePortal();

  if (isLoading) {
    return (
      <p className="py-12 text-center text-sm text-deep-teal/50">Loading affiliate account…</p>
    );
  }

  if (!isMain) {
    return (
      fallback ?? (
        <section className="overflow-hidden rounded-2xl border border-deep-teal/25 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.12)]">
          <div className="bg-deep-teal px-5 py-4 text-pure-white">
            <h2 className="font-serif text-lg font-light">Main affiliate only</h2>
          </div>
          <div className="p-6 text-center">
            <p className="text-sm text-deep-teal/60">
              Sub-affiliates can view their account, invite clinics, and see their own referrals.
            </p>
            <Link
              href="/portal/affiliate"
              className="mt-4 inline-flex rounded-full border border-deep-teal/25 px-4 py-2 text-sm font-medium text-deep-teal hover:bg-deep-teal/5"
            >
              Back to dashboard
            </Link>
          </div>
        </section>
      )
    );
  }

  return children;
}
