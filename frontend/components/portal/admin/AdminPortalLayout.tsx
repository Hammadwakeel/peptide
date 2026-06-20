"use client";

import { frontierSidebarIcons } from "@/components/icons/frontier/frontier-sidebar-icons";
import { RoleOnboardingJoyride } from "@/components/onboarding/RoleOnboardingJoyride";
import { PortalSidebarLayout, type SidebarLink } from "@/components/portal/shared/PortalSidebarLayout";
import { PortalBootstrap } from "@/components/bootstrap/PortalBootstrap";
import { AdminOrdersProvider } from "@/context/OrdersProvider";

const ADMIN_LINKS: SidebarLink[] = [
  { href: "/portal/admin/approvals", label: "Approval Queue", icon: frontierSidebarIcons.clipboardCheck },
  { href: "/portal/admin/users", label: "Users", icon: frontierSidebarIcons.users },
  { href: "/portal/admin/catalog", label: "Catalog", icon: frontierSidebarIcons.layoutGrid },
  { href: "/portal/admin/orders", label: "Orders", icon: frontierSidebarIcons.package },
  { href: "/portal/admin/payouts", label: "Payouts", icon: frontierSidebarIcons.wallet },
  { href: "/portal/admin/affiliates", label: "Affiliates", icon: frontierSidebarIcons.handshake },
  { href: "/portal/admin/wms", label: "WMS", icon: frontierSidebarIcons.warehouse },
  { href: "/portal/admin/reports", label: "Reports", icon: frontierSidebarIcons.barChart },
  { href: "/portal/admin/compliance", label: "Compliance", icon: frontierSidebarIcons.shield },
  { href: "/portal/admin/settings", label: "Settings", icon: frontierSidebarIcons.settings },
];

export function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminOrdersProvider>
      <PortalBootstrap role="admin" />
      <PortalSidebarLayout links={ADMIN_LINKS} onboardingRole="admin">
        <RoleOnboardingJoyride role="admin" />
        {children}
      </PortalSidebarLayout>
    </AdminOrdersProvider>
  );
}
