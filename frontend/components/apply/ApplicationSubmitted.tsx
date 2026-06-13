"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthCard, AuthShell, authLinkClassName } from "@/components/auth/AuthShell";
import { readApplicationSummary } from "@/lib/apply/storage";
import { formatApplicantName, type ClinicApplicationSummary } from "@/lib/apply/types";

export function ApplicationSubmitted() {
  const searchParams = useSearchParams();
  const [application, setApplication] = useState<ClinicApplicationSummary | null>(null);

  useEffect(() => {
    const stored = readApplicationSummary();
    if (stored) {
      setApplication(stored);
      return;
    }

    const ref = searchParams.get("ref");
    if (ref) {
      setApplication({
        id: ref,
        clinic_name: "",
        email: "",
        first_name: "",
        last_name: "",
        application_status: "pending_review",
      });
    }
  }, [searchParams]);

  return (
    <AuthShell background="merch-jacket" compact>
      <AuthCard compact>
        <div className="flex size-14 items-center justify-center rounded-full bg-pacific-teal/10 text-pacific-teal">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m5 12 5 5L19 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <h1 className="mt-5 font-sans text-2xl font-light text-deep-teal">
          Application submitted
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-deep-teal/65">
          Your application is pending admin review. You&apos;ll receive an email once it has been processed.
        </p>

        {application ? (
          <div className="mt-5 rounded-xl border border-deep-teal/10 bg-deep-teal/[0.03] px-4 py-3 text-sm text-deep-teal/75">
            {application.clinic_name ? (
              <p>
                <span className="font-light text-deep-teal">Clinic:</span> {application.clinic_name}
              </p>
            ) : null}
            {application.email ? (
              <p className="mt-1">
                <span className="font-light text-deep-teal">Email:</span> {application.email}
              </p>
            ) : null}
            {formatApplicantName(application) ? (
              <p className="mt-1">
                <span className="font-light text-deep-teal">Applicant:</span>{" "}
                {formatApplicantName(application)}
              </p>
            ) : null}
            <p className="mt-1">
              <span className="font-light text-deep-teal">Reference:</span> {application.id}
            </p>
            <p className="mt-1">
              <span className="font-light text-deep-teal">Status:</span>{" "}
              {application.application_status.replaceAll("_", " ")}
            </p>
          </div>
        ) : null}

        <p className="mt-6 text-center text-sm text-deep-teal/60">
          <Link href="/login" className={authLinkClassName}>
            Return to sign in
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}
