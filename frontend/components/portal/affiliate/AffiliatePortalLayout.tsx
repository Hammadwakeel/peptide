"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PortalSidebarLayout, type SidebarLink } from "@/components/portal/shared/PortalSidebarLayout";
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
      {children}
    </PortalSidebarLayout>
  );
}

export function AffiliatePortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AffiliatePortalProvider>
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
      <p className="rounded-2xl border border-deep-teal/10 bg-pure-white px-6 py-12 text-center text-sm text-deep-teal/50">
        Loading affiliate account…
      </p>
    );
  }

  if (!isMain) {
    return (
      fallback ?? (
        <div className="rounded-2xl border border-deep-teal/10 bg-pure-white p-6 text-center shadow-sm">
          <h2 className="font-serif text-xl font-light text-deep-teal">Main affiliate only</h2>
          <p className="mt-2 text-sm text-deep-teal/60">
            Sub-affiliates can view their account, invite clinics, and see their own referrals.
          </p>
          <Link
            href="/portal/affiliate"
            className="mt-4 inline-block text-sm text-pacific-teal hover:underline"
          >
            Back to dashboard
          </Link>
        </div>
      )
    );
  }

  return children;
}
