"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";

export type SidebarLink = {
  href: string;
  label: string;
  exact?: boolean;
  badge?: number;
};

type PortalSidebarLayoutProps = {
  portalLabel: string;
  brandTitle?: string;
  links: readonly SidebarLink[];
  children: React.ReactNode;
};

function isLinkActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  if (href === "/portal/admin/wms") {
    return pathname === href || pathname.startsWith("/portal/admin/wms/");
  }
  if (href === "/portal/admin/catalog") {
    return (
      pathname === href ||
      pathname.startsWith("/portal/admin/catalog/") ||
      pathname.startsWith("/portal/admin/products/")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalSidebarLayout({
  portalLabel,
  brandTitle = "Frontier Biomed",
  links,
  children,
}: PortalSidebarLayoutProps) {
  const pathname = usePathname();
  const { session, logout, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-pure-white text-deep-teal">
        Loading portal…
      </div>
    );
  }

  const activeLink = links.find((link) => isLinkActive(pathname, link.href, link.exact));

  return (
    <div className="min-h-dvh bg-pure-white text-deep-teal lg:flex">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-deep-teal/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-deep-teal/10 bg-pure-white transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-deep-teal/10 px-5 py-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-pacific-teal">
            {portalLabel}
          </p>
          <p className="mt-2 font-serif text-xl font-light text-deep-teal">{brandTitle}</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label={portalLabel}>
          {links.map((link) => {
            const active = isLinkActive(pathname, link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-deep-teal text-pure-white"
                    : "text-deep-teal/70 hover:bg-deep-teal/5 hover:text-deep-teal"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && link.badge > 0 ? (
                  <span
                    className={`flex size-5 items-center justify-center rounded-full text-[10px] font-medium ${
                      active ? "bg-pure-white text-deep-teal" : "bg-pacific-teal text-pure-white"
                    }`}
                  >
                    {link.badge > 9 ? "9+" : link.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-deep-teal/10 p-4">
          {session ? (
            <p className="mb-3 truncate px-2 text-xs text-deep-teal/50">{session.email}</p>
          ) : null}
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-xl border border-deep-teal/15 px-3 py-2.5 text-sm font-medium text-deep-teal transition-colors hover:border-pacific-teal hover:text-pacific-teal"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-deep-teal/10 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-deep-teal/15 p-2 text-deep-teal lg:hidden"
              aria-label="Open navigation"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <h1 className="font-serif text-xl font-light text-deep-teal sm:text-2xl">
              {activeLink?.label ?? portalLabel}
            </h1>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
