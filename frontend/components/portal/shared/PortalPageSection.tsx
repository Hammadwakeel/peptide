"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type PortalPageSectionProps = {
  icon: LucideIcon;
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
        className={`bg-deep-teal text-pure-white ${compact ? "px-4 py-2.5" : "px-5 py-4"}`}
      >
        <div className={`flex items-center ${compact ? "gap-2.5" : "gap-3"}`}>
          <div
            className={`flex shrink-0 items-center justify-center rounded-lg bg-pure-white/15 ${
              compact ? "size-8" : "size-9"
            }`}
            aria-hidden="true"
          >
            <Icon className={`text-pure-white ${compact ? "size-3.5" : "size-4"}`} />
          </div>
          <div className="min-w-0">
            <h2
              className={`font-sans font-light text-pure-white ${
                compact ? "truncate text-base leading-tight" : "text-lg"
              }`}
            >
              {title}
            </h2>
            {subtitle ? (
              <p
                className={`truncate text-pure-white/75 ${
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
