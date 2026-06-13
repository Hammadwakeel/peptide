"use client";

import { useAuth } from "@/context/AuthProvider";
import type { UserRole } from "@/lib/auth/types";

type PortalShellProps = {
  role: UserRole;
  title: string;
  description: string;
  children?: React.ReactNode;
};

const PORTAL_LABELS: Record<UserRole, string> = {
  affiliate: "Affiliate portal",
  admin: "Admin portal",
  patient: "Patient portal",
  doctor: "Doctor portal",
};

export function PortalShell({
  role,
  title,
  description,
  children,
}: PortalShellProps) {
  const { session, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-pure-white text-deep-teal">
        Loading portal…
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-pure-white text-deep-teal">
      <header className="border-b border-deep-teal/10 bg-pure-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="font-sans text-xs font-light text-pacific-teal">
              {PORTAL_LABELS[role]}
            </p>
            <h1 className="mt-1 font-sans text-2xl font-light">{title}</h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-light text-deep-teal transition-colors hover:bg-pacific-teal/12 hover:text-pacific-teal"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-[2rem] border border-deep-teal/10 bg-pure-white p-6 shadow-sm sm:p-8">
          <p className="max-w-2xl text-sm leading-relaxed text-deep-teal/65">
            {description}
          </p>
          {session ? (
            <p className="mt-4 font-mono text-xs text-deep-teal/45">
              Signed in as {session.email}
            </p>
          ) : null}
          {children}
        </div>
      </main>
    </div>
  );
}
