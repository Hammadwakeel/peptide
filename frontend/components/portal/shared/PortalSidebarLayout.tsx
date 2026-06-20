"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useEffect, useState } from "react";
import { FrontierLogomark } from "@/components/FrontierLogo";
import { ICON_SIZE_MD } from "@/components/icons/frontier";
import { frontierSidebarIcons } from "@/components/icons/frontier/frontier-sidebar-icons";
import {
  FloatingIconButton,
  FloatingIconLink,
} from "@/components/portal/shared/FloatingIconAction";
import { PortalOnboardingHeaderStrip } from "@/components/portal/shared/PortalOnboardingHeaderStrip";
import { Tooltip } from "@/components/ui/Tippy";
import { useAuth } from "@/context/AuthProvider";
import { useRoleOnboarding } from "@/lib/hooks/use-role-onboarding";
import { navTourId } from "@/lib/onboarding/tour-targets";
import type { UserRole } from "@/lib/auth/types";
import type { FrontierIconComponent } from "@/lib/icons/types";

export type SidebarLink = {
  href: string;
  label: string;
  icon: FrontierIconComponent;
  exact?: boolean;
  badge?: number;
};

type PortalSidebarLayoutProps = {
  links: readonly SidebarLink[];
  children: React.ReactNode;
  onboardingRole?: UserRole;
  onboardingFilterStepIds?: string[];
};

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
  const { logout, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function openSidebarForTour() {
      if (window.matchMedia("(max-width: 1023px)").matches) {
        setMobileOpen(true);
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
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh max-h-dvh w-[4.25rem] flex-col overflow-visible bg-transparent transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-40 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex justify-center px-2 pb-3 pt-4">
          <Link href={homeHref} aria-label="Frontier Biomed">
            <FrontierLogomark priority />
          </Link>
        </div>

        <nav
          className="min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-visible px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Portal navigation"
          data-tour="portal-nav"
        >
          {links.map((link) => (
            <FloatingIconLink
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              active={isLinkActive(pathname, link.href, link.exact)}
              badge={link.badge}
              onClick={() => setMobileOpen(false)}
              data-tour={navTourId(link.href)}
            />
          ))}
        </nav>

        <div className="px-2 pb-4 pt-2">
          <FloatingIconButton label="Sign out" icon={frontierSidebarIcons.logOut} onClick={logout} />
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
                  <frontierSidebarIcons.menu size={ICON_SIZE_MD} aria-hidden />
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
