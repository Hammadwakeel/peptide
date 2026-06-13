"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ApplyTabs } from "@/components/apply/wizard/ApplyTabs";
import { WIZARD_STEPS } from "@/lib/apply/types";

const STEP_DESCRIPTIONS: Record<number, string> = {
  1: "Share your practice details, credentials, and primary contact information.",
  2: "Upload compliance documents and optional branding for your storefront.",
  3: "Add encrypted banking details for secure clinic payouts.",
};

const MAIN_TABS = WIZARD_STEPS.map((step) => ({
  id: String(step.id),
  label: step.short,
}));

type ApplyShellProps = {
  currentStep: number;
  onTabChange: (step: number) => void;
  children: ReactNode;
  footer: ReactNode;
};

export function ApplyShell({
  currentStep,
  onTabChange,
  children,
  footer,
}: ApplyShellProps) {
  const stepMeta = WIZARD_STEPS.find((step) => step.id === currentStep);

  return (
    <div className="h-dvh overflow-hidden bg-surface-muted lg:grid lg:grid-cols-[minmax(300px,38%)_1fr]">
      <aside className="relative hidden overflow-hidden lg:block">
        <Image
          src="/brand/merch-jacket-embroidered-logo.png"
          alt=""
          fill
          priority
          aria-hidden="true"
          className="object-cover object-center"
          sizes="40vw"
        />
      </aside>

      <main className="flex h-dvh min-h-0 flex-col" data-tour="apply-form">
        <header className="shrink-0 border-b border-deep-teal/8 bg-pure-white/90 px-4 py-4 backdrop-blur-sm sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 lg:hidden">
                <p className="font-sans text-[10px] font-light text-pacific-teal">
                  Clinic application
                </p>
                <h1 className="mt-1 truncate font-sans text-xl font-light text-deep-teal">
                  {stepMeta?.label}
                </h1>
              </div>
              <div className="hidden min-w-0 lg:block">
                <p className="font-sans text-[10px] font-light text-pacific-teal">
                  Clinic application
                </p>
                <h1 className="mt-2 font-sans text-2xl font-light tracking-[-0.02em] text-deep-teal">
                  {stepMeta?.label}
                </h1>
                <p className="mt-1 text-sm text-deep-teal/55">{STEP_DESCRIPTIONS[currentStep]}</p>
              </div>
              <Link
                href="/login"
                className="shrink-0 text-sm font-light text-pacific-teal hover:underline"
              >
                Sign in
              </Link>
            </div>

            <ApplyTabs
              tabs={MAIN_TABS}
              activeId={String(currentStep)}
              onChange={(id) => onTabChange(Number(id))}
              variant="primary"
            />
          </div>
        </header>

        <div className="min-h-0 flex-1 px-4 py-4 sm:px-8 sm:py-5 lg:px-10">
          <div className="mx-auto flex h-full max-w-3xl min-h-0 flex-col">{children}</div>
        </div>

        <footer className="shrink-0 border-t border-deep-teal/8 bg-pure-white/95 px-4 py-4 backdrop-blur-md sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
            {footer}
          </div>
        </footer>
      </main>
    </div>
  );
}
