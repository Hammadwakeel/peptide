"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useChat } from "@/context/ChatProvider";
import { CLINIC_BRANDING } from "@/lib/patient-portal/mock-data";
import { PATIENT_PORTAL_TABS } from "@/lib/patient-portal/types";

function isTabActive(pathname: string, href: string) {
  if (href === "/portal/patient") {
    return pathname === "/portal/patient" || pathname === "/portal/patient/pay";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PatientPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, isLoading } = useAuth();
  const { patientUnreadTotal } = useChat();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-pure-white text-deep-teal">
        Loading portal…
      </div>
    );
  }

  const onProfile = pathname.startsWith("/portal/patient/profile");

  return (
    <div className="min-h-dvh bg-pure-white text-deep-teal">
      <header className="sticky top-0 z-40 border-b border-deep-teal/10 bg-pure-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/portal/patient" className="flex items-center gap-2.5">
            <div
              className="flex size-9 items-center justify-center rounded-lg text-xs font-semibold text-pure-white"
              style={{ backgroundColor: CLINIC_BRANDING.themeColor }}
            >
              {CLINIC_BRANDING.name.slice(0, 1)}
            </div>
            <span className="hidden font-medium text-deep-teal sm:inline">{CLINIC_BRANDING.name}</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Patient portal">
            {PATIENT_PORTAL_TABS.map((tab) => {
              const active = isTabActive(pathname, tab.href) && !onProfile;
              const badge = tab.key === "chat" ? patientUnreadTotal : 0;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium lg:text-sm ${
                    active
                      ? "bg-deep-teal text-pure-white"
                      : "text-deep-teal/65 hover:bg-deep-teal/5"
                  }`}
                >
                  {tab.label}
                  {badge > 0 ? (
                    <span
                      className={`flex size-5 items-center justify-center rounded-full text-[10px] font-medium ${
                        active ? "bg-pure-white text-deep-teal" : "bg-pacific-teal text-pure-white"
                      }`}
                    >
                      {badge > 9 ? "9+" : badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/portal/patient/profile"
            aria-label="Account profile"
            className={`flex size-10 items-center justify-center rounded-full border ${
              onProfile
                ? "border-deep-teal bg-deep-teal text-pure-white"
                : "border-deep-teal/15 text-deep-teal hover:border-pacific-teal"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Link>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-deep-teal/10 px-4 py-2 md:hidden" aria-label="Patient portal mobile">
          {PATIENT_PORTAL_TABS.map((tab) => {
            const active = isTabActive(pathname, tab.href) && !onProfile;
            const badge = tab.key === "chat" ? patientUnreadTotal : 0;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${
                  active ? "bg-deep-teal text-pure-white" : "text-deep-teal/65"
                }`}
              >
                {tab.label}
                {badge > 0 ? (
                  <span className="flex size-4 items-center justify-center rounded-full bg-pacific-teal text-[9px] text-pure-white">
                    {badge > 9 ? "9+" : badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>

      <footer className="border-t border-deep-teal/10 py-4 text-center text-xs text-deep-teal/40">
        <button type="button" onClick={logout} className="sr-only">
          Sign out
        </button>
      </footer>
    </div>
  );
}
