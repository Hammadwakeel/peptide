"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LogOut,
  Menu,
  PanelLeftClose,
} from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import { FrontierLogo } from "@/components/FrontierLogo";
import { PortalOnboardingHeaderStrip } from "@/components/portal/shared/PortalOnboardingHeaderStrip";
import { Tooltip, TruncateTooltip } from "@/components/ui/Tippy";
import { useAuth } from "@/context/AuthProvider";
import { btnGhostClass } from "@/lib/brand/design-system";
import { useRoleOnboarding } from "@/lib/hooks/use-role-onboarding";
import { navTourId } from "@/lib/onboarding/tour-targets";
import type { UserRole } from "@/lib/auth/types";

export type SidebarLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: number;
};

type PortalSidebarLayoutProps = {
  links: readonly SidebarLink[];
  children: React.ReactNode;
  onboardingRole?: UserRole;
  onboardingFilterStepIds?: string[];
};

const SIDEBAR_PIN_KEY = "frontier-sidebar-pinned";

function isLinkActive(pathname: string, href: string, exact?: boolean) {
  if (href === "/portal/patient") {
    return pathname === href || pathname === "/portal/patient/pay";
  }
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

export const PortalSidebarLayout = memo(function PortalSidebarLayout({
  links,
  children,
  onboardingRole,
  onboardingFilterStepIds,
}: PortalSidebarLayoutProps) {
  const pathname = usePathname();
  const { session, logout, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_PIN_KEY);
      if (stored === "collapsed") setPinned(false);
    } catch {
      /* ignore */
    }
  }, []);

  const togglePinned = useCallback(() => {
    setPinned((current) => {
      const next = !current;
      try {
        localStorage.setItem(SIDEBAR_PIN_KEY, next ? "expanded" : "collapsed");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const expandSidebar = useCallback(() => {
    setPinned(true);
    try {
      localStorage.setItem(SIDEBAR_PIN_KEY, "expanded");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    function openSidebarForTour() {
      if (window.matchMedia("(max-width: 1023px)").matches) {
        setMobileOpen(true);
      } else {
        setPinned(true);
      }
    }

    window.addEventListener("frontier:joyride-nav-step", openSidebarForTour);
    return () => window.removeEventListener("frontier:joyride-nav-step", openSidebarForTour);
  }, []);

  const onboarding = useRoleOnboarding(onboardingRole ?? "admin", onboardingFilterStepIds);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-pure-white text-deep-teal">
        Loading portal…
      </div>
    );
  }

  const activeLink = links.find((link) => isLinkActive(pathname, link.href, link.exact));
  const homeHref = links[0]?.href ?? "/";
  const hideHeaderTitle = pathname.startsWith("/portal/");
  const showOnboardingStrip =
    Boolean(onboardingRole) && onboarding.isVisible && onboarding.progressSteps.length > 0;
  const hideDesktopHeader = hideHeaderTitle && !showOnboardingStrip;

  const desktopExpanded = pinned;

  function renderCollapsedHoverTile(
    label: string,
    Icon: LucideIcon,
    active: boolean,
    badge?: number,
  ) {
    return (
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-[calc(100%+0.625rem)] top-1/2 z-[100] flex -translate-y-1/2 items-center gap-2.5 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-light opacity-0 shadow-[0_8px_24px_rgba(1,26,36,0.12)] transition-opacity duration-150 group-hover/nav:opacity-100 lg:flex ${
          active
            ? "border-deep-teal/15 bg-deep-teal text-pure-white"
            : "border-deep-teal/10 bg-pure-white text-deep-teal"
        }`}
      >
        <Icon className="size-[1.125rem] shrink-0" strokeWidth={1.75} />
        <span>{label}</span>
        {badge && badge > 0 ? (
          <span
            className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-light ${
              active ? "bg-pure-white text-deep-teal" : "bg-pacific-teal text-pure-white"
            }`}
          >
            {badge > 9 ? "9+" : badge}
          </span>
        ) : null}
      </span>
    );
  }

  function renderNavLink(link: SidebarLink, onNavigate?: () => void) {
    const active = isLinkActive(pathname, link.href, link.exact);
    const Icon = link.icon;

    return (
      <Link
        key={link.href}
        href={link.href}
        data-tour={navTourId(link.href)}
        onClick={onNavigate}
        className={`group/nav relative flex items-center overflow-visible rounded-lg transition-all duration-200 max-lg:justify-between max-lg:rounded-xl max-lg:px-3 max-lg:py-2.5 lg:py-2 ${
          desktopExpanded ? "lg:gap-3 lg:px-2.5" : "lg:justify-center lg:px-0"
        } ${
          active
            ? "bg-deep-teal text-pure-white lg:shadow-sm"
            : "text-deep-teal/70 hover:bg-deep-teal/5 hover:text-deep-teal"
        }`}
      >
        <span className={`flex min-w-0 items-center max-lg:gap-3 ${desktopExpanded ? "lg:gap-3" : "lg:gap-0"}`}>
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-md transition-colors ${
              active ? "bg-pure-white/15 lg:bg-transparent" : "lg:group-hover/nav:bg-deep-teal/5"
            }`}
          >
            <Icon className="size-[1.125rem]" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span
            className={`truncate text-sm font-light max-lg:block ${
              desktopExpanded ? "lg:block lg:max-w-[11rem]" : "lg:hidden"
            }`}
          >
            {link.label}
          </span>
        </span>

        {link.badge && link.badge > 0 ? (
          <span
            className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-light ${
              active ? "bg-pure-white text-deep-teal" : "bg-pacific-teal text-pure-white"
            } max-lg:static ${desktopExpanded ? "lg:absolute lg:right-2 lg:top-1/2 lg:-translate-y-1/2" : "lg:hidden"}`}
          >
            {link.badge > 9 ? "9+" : link.badge}
          </span>
        ) : null}

        {!desktopExpanded ? renderCollapsedHoverTile(link.label, Icon, active, link.badge) : null}
      </Link>
    );
  }

  return (
    <div className="min-h-dvh bg-pure-white text-deep-teal lg:flex">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-deep-teal/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh max-h-dvh flex-col overflow-visible border-r border-deep-teal/10 bg-pure-white transition-[width,transform] duration-300 ease-out max-lg:w-72 lg:sticky lg:top-0 lg:z-40 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${desktopExpanded ? "lg:w-60" : "lg:w-[4.25rem]"}`}
      >
        <div
          className={`flex items-center border-b border-deep-teal/10 py-4 ${
            desktopExpanded ? "justify-between gap-2 px-3 lg:px-2.5" : "justify-center px-2 lg:px-2"
          }`}
        >
          {desktopExpanded ? (
            <Link
              href={homeHref}
              aria-label="Frontier Biomed"
              className="min-w-0 flex-1 overflow-hidden"
            >
              <FrontierLogo variant="light" />
            </Link>
          ) : (
            <>
              <Link
                href={homeHref}
                aria-label="Frontier Biomed"
                className="min-w-0 lg:hidden"
              >
                <FrontierLogo variant="light" />
              </Link>
              <button
                type="button"
                onClick={expandSidebar}
                aria-label="Expand sidebar"
                className="hidden min-w-0 cursor-pointer lg:flex lg:justify-center"
              >
                <FrontierLogo variant="light" compact />
              </button>
            </>
          )}

          {desktopExpanded ? (
            <Tooltip content="Collapse sidebar">
              <button
                type="button"
                onClick={togglePinned}
                className="hidden rounded-lg border border-deep-teal/10 p-2 text-deep-teal/70 transition-colors hover:bg-deep-teal/5 hover:text-deep-teal lg:inline-flex"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="size-4" strokeWidth={1.75} />
              </button>
            </Tooltip>
          ) : null}
        </div>

        <nav
          className="flex-1 min-h-0 space-y-0.5 overflow-hidden px-2 py-3 max-lg:space-y-1 max-lg:overflow-y-auto max-lg:px-3 lg:overflow-visible lg:px-2 [scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden"
          aria-label="Portal navigation"
          data-tour="portal-nav"
        >
          {links.map((link) => renderNavLink(link, () => setMobileOpen(false)))}
        </nav>

        <div className="border-t border-deep-teal/10 p-2 max-lg:p-4">
          {session ? (
            <TruncateTooltip content={session.email}>
              <p
                className={`mb-2 truncate px-2 text-xs text-deep-teal/50 transition-opacity duration-300 ${
                  desktopExpanded ? "lg:opacity-100" : "lg:h-0 lg:overflow-hidden lg:opacity-0"
                } max-lg:mb-3 max-lg:h-auto max-lg:opacity-100`}
              >
                {session.email}
              </p>
            </TruncateTooltip>
          ) : null}
          <button
            type="button"
            onClick={logout}
            className={`group/nav relative flex w-full items-center justify-center gap-2 overflow-visible rounded-lg px-2.5 py-2.5 max-lg:rounded-xl ${btnGhostClass}`}
          >
            <LogOut className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span
              className={`truncate transition-all duration-300 max-lg:inline lg:overflow-hidden lg:whitespace-nowrap ${
                desktopExpanded ? "lg:max-w-[8rem] lg:opacity-100" : "lg:max-w-0 lg:opacity-0"
              }`}
            >
              Sign out
            </span>
            {!desktopExpanded
              ? renderCollapsedHoverTile("Sign out", LogOut, false)
              : null}
          </button>
        </div>
      </aside>

      <div className="relative z-0 flex min-h-dvh min-w-0 flex-1 flex-col">
        <header
          className={`sticky top-0 z-30 border-b border-deep-teal/10 bg-pure-white/95 backdrop-blur-sm ${
            hideDesktopHeader ? "lg:hidden" : hideHeaderTitle ? "lg:border-b-0" : ""
          }`}
        >
          <div
            className={`flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 ${
              hideHeaderTitle ? "py-2.5 lg:hidden" : "py-3"
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <Tooltip content="Open navigation">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="rounded-lg border border-deep-teal/15 p-2 text-deep-teal lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="size-[1.125rem]" strokeWidth={1.75} />
                </button>
              </Tooltip>
              {!hideHeaderTitle ? (
                <h1 className="truncate font-sans text-xl font-extrabold tracking-[-0.01em] text-deep-teal sm:text-2xl">
                  {activeLink?.label ?? "Dashboard"}
                </h1>
              ) : null}
            </div>
          </div>

          {onboardingRole ? (
            <PortalOnboardingHeaderStrip
              role={onboardingRole}
              filterStepIds={onboardingFilterStepIds}
            />
          ) : null}
        </header>

        <main
          className="flex-1 px-4 pb-5 pt-2 sm:px-6 lg:px-8 lg:pb-6 lg:pt-3"
          data-tour="portal-main"
        >
          {children}
        </main>
      </div>
    </div>
  );
});
