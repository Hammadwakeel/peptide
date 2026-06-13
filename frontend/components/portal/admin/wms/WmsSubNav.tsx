"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const WMS_LINKS = [
  { href: "/portal/admin/wms", label: "Dashboard", exact: true },
  { href: "/portal/admin/wms/queue", label: "Fulfillment Queue" },
  { href: "/portal/admin/wms/import", label: "Bulk Import" },
  { href: "/portal/admin/wms/reports", label: "Reports" },
  { href: "/portal/admin/wms/inventory", label: "Inventory Alerts" },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function WmsSubNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2">
      {WMS_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`rounded-full px-4 py-2 text-sm font-light transition-colors ${
            isActive(pathname, link.href, "exact" in link ? link.exact : false)
              ? "bg-deep-teal text-pure-white"
              : "border border-deep-teal/15 text-deep-teal/70 hover:bg-deep-teal/5"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
