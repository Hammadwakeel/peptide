"use client";

import { useMemo } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  ShoppingBag,
  User,
} from "lucide-react";
import { RoleOnboardingJoyride } from "@/components/onboarding/RoleOnboardingJoyride";
import { PortalSidebarLayout, type SidebarLink } from "@/components/portal/shared/PortalSidebarLayout";
import { usePatientUnreadTotal } from "@/context/ChatProvider";

const BASE_PATIENT_LINKS: Omit<SidebarLink, "badge">[] = [
  { href: "/portal/patient", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/portal/patient/orders", label: "Orders", icon: Package, exact: false },
  { href: "/portal/patient/products", label: "Products", icon: ShoppingBag, exact: false },
  { href: "/portal/patient/chat", label: "Chat", icon: MessageSquare, exact: false },
  { href: "/portal/patient/profile", label: "Account", icon: User, exact: true },
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
