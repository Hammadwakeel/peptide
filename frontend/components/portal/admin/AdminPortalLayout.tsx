"use client";

import {
  BarChart3,
  ClipboardCheck,
  Handshake,
  LayoutGrid,
  Package,
  Settings,
  Shield,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";
import { RoleOnboardingJoyride } from "@/components/onboarding/RoleOnboardingJoyride";
import { PortalSidebarLayout, type SidebarLink } from "@/components/portal/shared/PortalSidebarLayout";
import { PortalBootstrap } from "@/components/bootstrap/PortalBootstrap";
import { AdminOrdersProvider } from "@/context/OrdersProvider";

const ADMIN_LINKS: SidebarLink[] = [
  { href: "/portal/admin/approvals", label: "Approval Queue", icon: ClipboardCheck },
  { href: "/portal/admin/users", label: "Users", icon: Users },
  { href: "/portal/admin/catalog", label: "Catalog", icon: LayoutGrid },
  { href: "/portal/admin/orders", label: "Orders", icon: Package },
  { href: "/portal/admin/payouts", label: "Payouts", icon: Wallet },
  { href: "/portal/admin/affiliates", label: "Affiliates", icon: Handshake },
  { href: "/portal/admin/wms", label: "WMS", icon: Warehouse },
  { href: "/portal/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/portal/admin/compliance", label: "Compliance", icon: Shield },
  { href: "/portal/admin/settings", label: "Settings", icon: Settings },
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
