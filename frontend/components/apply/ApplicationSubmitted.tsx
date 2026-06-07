"use client";

import Link from "next/link";
import { AuthCard, AuthShell, authLinkClassName } from "@/components/auth/AuthShell";

export function ApplicationSubmitted() {
  return (
    <AuthShell background="merch-jacket" compact>
      <AuthCard compact>
        <div className="flex size-14 items-center justify-center rounded-full bg-pacific-teal/10 text-pacific-teal">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m5 12 5 5L19 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <h1 className="mt-5 font-serif text-2xl font-light text-deep-teal">
          Application submitted
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-deep-teal/65">
          Your application is under review. You&apos;ll receive an email within 24–48 hours.
        </p>

        <p className="mt-6 text-center text-sm text-deep-teal/60">
          <Link href="/login" className={authLinkClassName}>
            Return to sign in
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}
