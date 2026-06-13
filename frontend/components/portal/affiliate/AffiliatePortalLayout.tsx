"use client";

import { useMemo } from "react";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react";
import { RoleOnboardingJoyride } from "@/components/onboarding/RoleOnboardingJoyride";
import { PortalSidebarLayout, type SidebarLink } from "@/components/portal/shared/PortalSidebarLayout";
import { PortalBootstrap } from "@/components/bootstrap/PortalBootstrap";
import { AffiliatePortalProvider, useAffiliatePortal } from "@/context/AffiliatePortalProvider";

const BASE_AFFILIATE_LINKS: SidebarLink[] = [
  { href: "/portal/affiliate", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/portal/affiliate/clinics/invite", label: "Invite Clinic", icon: UserPlus },
  { href: "/portal/affiliate/referrals", label: "Clinic Referrals", icon: Users },
];

const MAIN_AFFILIATE_LINKS: SidebarLink[] = [
  { href: "/portal/affiliate/sub-affiliates", label: "Sub-Affiliates", icon: UsersRound },
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
    <PortalSidebarLayout
      links={links}
      onboardingRole="affiliate"
      onboardingFilterStepIds={isMain ? undefined : ["sub-affiliates"]}
    >
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
