"use client";

import { PortalSidebarLayout, type SidebarLink } from "@/components/portal/shared/PortalSidebarLayout";
import { AdminOrdersProvider } from "@/context/OrdersProvider";

const ADMIN_LINKS: SidebarLink[] = [
  { href: "/portal/admin/approvals", label: "Approval Queue" },
  { href: "/portal/admin/users", label: "Users" },
  { href: "/portal/admin/catalog", label: "Catalog" },
  { href: "/portal/admin/orders", label: "Orders" },
  { href: "/portal/admin/payouts", label: "Payouts" },
  { href: "/portal/admin/affiliates", label: "Affiliates" },
  { href: "/portal/admin/wms", label: "WMS" },
  { href: "/portal/admin/reports", label: "Reports" },
  { href: "/portal/admin/compliance", label: "Compliance" },
  { href: "/portal/admin/settings", label: "Settings" },
];

export function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminOrdersProvider>
      <PortalSidebarLayout portalLabel="Admin portal" links={ADMIN_LINKS}>
        {children}
      </PortalSidebarLayout>
    </AdminOrdersProvider>
  );
}
