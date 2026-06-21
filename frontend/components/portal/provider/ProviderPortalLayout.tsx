"use client";

import { useMemo } from "react";
import { frontierSidebarIcons } from "@/components/icons/frontier/frontier-sidebar-icons";
import { PortalSidebarLayout, type SidebarLink } from "@/components/portal/shared/PortalSidebarLayout";
import { OrdersProvider } from "@/context/OrdersProvider";
import { ChatProvider, useProviderUnreadTotal } from "@/context/ChatProvider";
import { PatientsProvider } from "@/context/PatientsProvider";
import { PortalBootstrap } from "@/components/bootstrap/PortalBootstrap";
import { ProviderPortalProvider } from "@/context/ProviderPortalProvider";
import { DoctorOnboardingProvider } from "@/context/DoctorOnboardingProvider";

const BASE_PROVIDER_LINKS: Omit<SidebarLink, "badge">[] = [
  { href: "/portal/doctor", label: "Dashboard", icon: frontierSidebarIcons.layoutDashboard, exact: true },
  { href: "/portal/doctor/inventory", label: "Inventory", icon: frontierSidebarIcons.layoutGrid, exact: false },
  { href: "/portal/doctor/my-store", label: "My Store", icon: frontierSidebarIcons.store, exact: false },
  { href: "/portal/doctor/customers", label: "Customers", icon: frontierSidebarIcons.users, exact: false },
  { href: "/portal/doctor/orders", label: "Orders", icon: frontierSidebarIcons.package, exact: false },
  { href: "/portal/doctor/accounting", label: "Accounting", icon: frontierSidebarIcons.calculator, exact: false },
  { href: "/portal/doctor/messages", label: "Messages", icon: frontierSidebarIcons.messageSquare, exact: false },
  { href: "/portal/doctor/users", label: "Organization Users", icon: frontierSidebarIcons.usersRound, exact: false },
  { href: "/portal/doctor/settings", label: "Settings", icon: frontierSidebarIcons.settings, exact: false },
  { href: "/portal/doctor/help", label: "Help / Support", icon: frontierSidebarIcons.helpCircle, exact: false },
];

function ProviderPortalShell({ children }: { children: React.ReactNode }) {
  const providerUnreadTotal = useProviderUnreadTotal();

  const links = useMemo(
    (): SidebarLink[] =>
      BASE_PROVIDER_LINKS.map((link) =>
        link.href === "/portal/doctor/messages"
          ? { ...link, badge: providerUnreadTotal }
          : link,
      ),
    [providerUnreadTotal],
  );

  return (
    <PortalSidebarLayout links={links}>
      {children}
    </PortalSidebarLayout>
  );
}

export function ProviderPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProviderPortalProvider>
      <PortalBootstrap role="doctor" />
      <OrdersProvider>
        <PatientsProvider>
          <ChatProvider>
            <DoctorOnboardingProvider>
              <ProviderPortalShell>{children}</ProviderPortalShell>
            </DoctorOnboardingProvider>
          </ChatProvider>
        </PatientsProvider>
      </OrdersProvider>
    </ProviderPortalProvider>
  );
}
