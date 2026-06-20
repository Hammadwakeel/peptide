"use client";

import { useMemo } from "react";
import { frontierSidebarIcons } from "@/components/icons/frontier/frontier-sidebar-icons";
import { RoleOnboardingJoyride } from "@/components/onboarding/RoleOnboardingJoyride";
import { PortalSidebarLayout, type SidebarLink } from "@/components/portal/shared/PortalSidebarLayout";
import { usePatientUnreadTotal } from "@/context/ChatProvider";

const BASE_PATIENT_LINKS: Omit<SidebarLink, "badge">[] = [
  { href: "/portal/patient", label: "Dashboard", icon: frontierSidebarIcons.layoutDashboard, exact: true },
  { href: "/portal/patient/orders", label: "Orders", icon: frontierSidebarIcons.package, exact: false },
  { href: "/portal/patient/products", label: "Products", icon: frontierSidebarIcons.shoppingBag, exact: false },
  { href: "/portal/patient/chat", label: "Chat", icon: frontierSidebarIcons.messageSquare, exact: false },
  { href: "/portal/patient/profile", label: "Account", icon: frontierSidebarIcons.user, exact: true },
];

export function PatientPortalLayout({ children }: { children: React.ReactNode }) {
  const patientUnreadTotal = usePatientUnreadTotal();

  const links = useMemo(
    (): SidebarLink[] =>
      BASE_PATIENT_LINKS.map((link) =>
        link.href === "/portal/patient/chat"
          ? { ...link, badge: patientUnreadTotal }
          : link,
      ),
    [patientUnreadTotal],
  );

  return (
    <PortalSidebarLayout links={links} onboardingRole="patient">
      <RoleOnboardingJoyride role="patient" />
      {children}
    </PortalSidebarLayout>
  );
}
