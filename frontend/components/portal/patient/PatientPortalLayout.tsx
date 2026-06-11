"use client";

import { useMemo } from "react";
import { RoleOnboardingJoyride } from "@/components/onboarding/RoleOnboardingJoyride";
import { PortalSidebarLayout, type SidebarLink } from "@/components/portal/shared/PortalSidebarLayout";
import { usePatientUnreadTotal } from "@/context/ChatProvider";
import { usePatientPortal } from "@/context/PatientPortalProvider";

const BASE_PATIENT_LINKS: Omit<SidebarLink, "badge">[] = [
  { href: "/portal/patient", label: "Dashboard", exact: true },
  { href: "/portal/patient/orders", label: "Orders", exact: false },
  { href: "/portal/patient/products", label: "Products", exact: false },
  { href: "/portal/patient/chat", label: "Chat", exact: false },
  { href: "/portal/patient/profile", label: "Account", exact: true },
];

export function PatientPortalLayout({ children }: { children: React.ReactNode }) {
  const { clinicName } = usePatientPortal();
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
    <PortalSidebarLayout
      portalLabel="Patient portal"
      brandTitle={clinicName ?? "Frontier Biomed"}
      links={links}
    >
      <RoleOnboardingJoyride role="patient" />
      {children}
    </PortalSidebarLayout>
  );
}
