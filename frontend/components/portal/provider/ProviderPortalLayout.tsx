"use client";

import { useMemo } from "react";
import {
  Calculator,
  HelpCircle,
  LayoutDashboard,
  LayoutGrid,
  MessageSquare,
  Package,
  Settings,
  Store,
  Users,
  UsersRound,
} from "lucide-react";
import { RoleOnboardingJoyride } from "@/components/onboarding/RoleOnboardingJoyride";
import { PortalSidebarLayout, type SidebarLink } from "@/components/portal/shared/PortalSidebarLayout";
import { OrdersProvider } from "@/context/OrdersProvider";
import { ChatProvider, useProviderUnreadTotal } from "@/context/ChatProvider";
import { PatientsProvider } from "@/context/PatientsProvider";
import { PortalBootstrap } from "@/components/bootstrap/PortalBootstrap";
import { ProviderPortalProvider } from "@/context/ProviderPortalProvider";

const BASE_PROVIDER_LINKS: Omit<SidebarLink, "badge">[] = [
  { href: "/portal/doctor", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/portal/doctor/inventory", label: "Inventory", icon: LayoutGrid, exact: false },
  { href: "/portal/doctor/my-store", label: "My Store", icon: Store, exact: false },
  { href: "/portal/doctor/customers", label: "Customers", icon: Users, exact: false },
  { href: "/portal/doctor/orders", label: "Orders", icon: Package, exact: false },
  { href: "/portal/doctor/accounting", label: "Accounting", icon: Calculator, exact: false },
  { href: "/portal/doctor/messages", label: "Messages", icon: MessageSquare, exact: false },
  { href: "/portal/doctor/users", label: "Organization Users", icon: UsersRound, exact: false },
  { href: "/portal/doctor/settings", label: "Settings", icon: Settings, exact: false },
  { href: "/portal/doctor/help", label: "Help / Support", icon: HelpCircle, exact: false },
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
    <PortalSidebarLayout links={links} onboardingRole="doctor">
      <RoleOnboardingJoyride role="doctor" />
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
            <ProviderPortalShell>{children}</ProviderPortalShell>
          </ChatProvider>
        </PatientsProvider>
      </OrdersProvider>
    </ProviderPortalProvider>
  );
}
