"use client";

import { useMemo } from "react";
import { RoleOnboardingJoyride } from "@/components/onboarding/RoleOnboardingJoyride";
import { PortalSidebarLayout, type SidebarLink } from "@/components/portal/shared/PortalSidebarLayout";
import { OrdersProvider } from "@/context/OrdersProvider";
import { ChatProvider, useProviderUnreadTotal } from "@/context/ChatProvider";
import { PatientsProvider } from "@/context/PatientsProvider";
import { PortalBootstrap } from "@/components/bootstrap/PortalBootstrap";
import { ProviderPortalProvider } from "@/context/ProviderPortalProvider";

const BASE_PROVIDER_LINKS: Omit<SidebarLink, "badge">[] = [
  { href: "/portal/doctor", label: "Dashboard", exact: true },
  { href: "/portal/doctor/inventory", label: "Inventory", exact: false },
  { href: "/portal/doctor/my-store", label: "My Store", exact: false },
  { href: "/portal/doctor/customers", label: "Customers", exact: false },
  { href: "/portal/doctor/orders", label: "Orders", exact: false },
  { href: "/portal/doctor/accounting", label: "Accounting", exact: false },
  { href: "/portal/doctor/messages", label: "Messages", exact: false },
  { href: "/portal/doctor/users", label: "Organization Users", exact: false },
  { href: "/portal/doctor/settings", label: "Settings", exact: false },
  { href: "/portal/doctor/help", label: "Help / Support", exact: false },
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
    <PortalSidebarLayout portalLabel="Provider portal" links={links}>
      <RoleOnboardingJoyride role="doctor" />
      {children}
    </PortalSidebarLayout>
  );
}

export function ProviderPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProviderPortalProvider>
      <PortalBootstrap role="doctor" />
      <PatientsProvider>
        <OrdersProvider>
          <ChatProvider>
            <ProviderPortalShell>{children}</ProviderPortalShell>
          </ChatProvider>
        </OrdersProvider>
      </PatientsProvider>
    </ProviderPortalProvider>
  );
}
