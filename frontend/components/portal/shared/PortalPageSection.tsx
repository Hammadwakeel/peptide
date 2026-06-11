"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type PortalPageSectionProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  children: ReactNode;
  noPadding?: boolean;
  className?: string;
};

export function PortalPageSection({
  icon: Icon,
  title,
  subtitle,
  children,
  noPadding = false,
  className = "",
}: PortalPageSectionProps) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-deep-teal/25 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.12)] ${className}`}
    >
      <div className="bg-deep-teal px-5 py-4 text-pure-white">
        <div className="flex items-center gap-3">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-pure-white/15"
            aria-hidden="true"
          >
            <Icon className="size-4" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-light">{title}</h2>
            {subtitle ? <p className="text-xs text-pure-white/75">{subtitle}</p> : null}
          </div>
        </div>
      </div>
      <div className={noPadding ? undefined : "p-5"}>{children}</div>
    </section>
  );
}
