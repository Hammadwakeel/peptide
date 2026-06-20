"use client";

import type { ReactNode } from "react";
import type { FrontierIconComponent } from "@/lib/icons/types";

type PortalPageSectionProps = {
  icon: FrontierIconComponent;
  title: string;
  subtitle?: string;
  children: ReactNode;
  noPadding?: boolean;
  compact?: boolean;
  className?: string;
};

export function PortalPageSection({
  icon: Icon,
  title,
  subtitle,
  children,
  noPadding = false,
  compact = false,
  className = "",
}: PortalPageSectionProps) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-deep-teal/25 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.12)] ${className}`}
    >
      <div
        className={`border-b border-deep-teal/10 ${compact ? "px-4 py-2.5" : "px-5 py-4"}`}
      >
        <div className={`flex items-center ${compact ? "gap-2.5" : "gap-3"}`}>
          <div
            className={`flex shrink-0 items-center justify-center rounded-lg border border-deep-teal/15 bg-deep-teal/5 ${
              compact ? "size-8" : "size-9"
            }`}
            aria-hidden="true"
          >
            <Icon size={compact ? 14 : 16} />
          </div>
          <div className="min-w-0">
            <h2
              className={`font-sans font-semibold tracking-[-0.01em] text-deep-teal ${
                compact ? "truncate text-base leading-tight" : "text-lg"
              }`}
            >
              {title}
            </h2>
            {subtitle ? (
              <p
                className={`truncate text-deep-teal/60 ${
                  compact ? "text-[11px] leading-snug" : "text-xs"
                }`}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div className={noPadding ? undefined : compact ? "p-3.5" : "p-5"}>{children}</div>
    </section>
  );
}
