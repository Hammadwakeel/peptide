"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthCard, AuthShell, authLinkClassName } from "@/components/auth/AuthShell";
import { readResetToken } from "@/lib/auth/storage";

export function ForgotPasswordConfirmation() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your email";
  const resetToken = readResetToken();

  return (
    <AuthShell background="hands">
      <AuthCard>
        <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-pacific-teal/10 text-pacific-teal">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 7h16v10H4V7Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="m4 7 8 6 8-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <span className="font-sans text-xs font-light text-pacific-teal">
          Check your inbox
        </span>
        <h1 className="mt-3 font-sans text-2xl font-light tracking-[-0.02em] text-deep-teal sm:text-3xl">
          Reset link sent
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-deep-teal/60">
          If an account exists for{" "}
          <span className="font-light text-deep-teal">{email}</span>, you will
          receive password reset instructions shortly.
        </p>

        {resetToken ? (
          <div className="mt-6 rounded-xl border border-deep-teal/10 bg-deep-teal/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-deep-teal/45">
              Frontend preview
            </p>
            <p className="mt-2 text-sm text-deep-teal/70">
              Continue to the reset password screen to complete the flow.
            </p>
            <Link
              href={`/reset-password?token=${encodeURIComponent(resetToken)}`}
              className={`mt-4 inline-flex text-sm ${authLinkClassName}`}
            >
              Continue to reset password
            </Link>
          </div>
        ) : null}

        <p className="mt-8 text-center text-sm text-deep-teal/60">
          <Link href="/login" className={authLinkClassName}>
            Return to sign in
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}
