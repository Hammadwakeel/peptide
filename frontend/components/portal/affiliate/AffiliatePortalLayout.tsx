"use client";

import { useMemo } from "react";
import { frontierSidebarIcons } from "@/components/icons/frontier/frontier-sidebar-icons";
import { PortalSidebarLayout, type SidebarLink } from "@/components/portal/shared/PortalSidebarLayout";
import { PortalBootstrap } from "@/components/bootstrap/PortalBootstrap";
import { AffiliatePortalProvider, useAffiliatePortal } from "@/context/AffiliatePortalProvider";

const BASE_AFFILIATE_LINKS: SidebarLink[] = [
  { href: "/portal/affiliate", label: "Dashboard", icon: frontierSidebarIcons.layoutDashboard, exact: true },
  { href: "/portal/affiliate/clinics/invite", label: "Invite Clinic", icon: frontierSidebarIcons.userPlus },
  { href: "/portal/affiliate/referrals", label: "Clinic Referrals", icon: frontierSidebarIcons.users },
];

const MAIN_AFFILIATE_LINKS: SidebarLink[] = [
  { href: "/portal/affiliate/sub-affiliates", label: "Sub-Affiliates", icon: frontierSidebarIcons.usersRound },
];

export function MainAffiliateOnly({ children }: { children: React.ReactNode }) {
  const { isMain, isLoading } = useAffiliatePortal();

  if (isLoading) {
    return <p className="py-12 text-center text-sm text-deep-teal/50">Loading affiliate account…</p>;
  }

  if (!isMain) {
    return (
      <p className="py-12 text-center text-sm text-deep-teal/50">
        Sub-affiliate management is only available to main affiliates.
      </p>
    );
  }

  return children;
}

function AffiliatePortalShell({ children }: { children: React.ReactNode }) {
  const { isMain } = useAffiliatePortal();

  const links = useMemo(
    () => (isMain ? [...BASE_AFFILIATE_LINKS, ...MAIN_AFFILIATE_LINKS] : BASE_AFFILIATE_LINKS),
    [isMain],
  );

  return (
    <PortalSidebarLayout links={links}>
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
