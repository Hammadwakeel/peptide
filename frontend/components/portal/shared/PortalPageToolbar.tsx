"use client";

import type { ReactNode } from "react";

type PortalPageToolbarProps = {
  title: string;
  children?: ReactNode;
};

export function PortalPageToolbar({ title, children }: PortalPageToolbarProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-deep-teal/20 bg-pure-white px-4 py-3 shadow-[0_2px_12px_rgba(1,26,36,0.08)] sm:px-5">
      <h1 className="shrink-0 font-serif text-xl font-light text-deep-teal sm:text-2xl">{title}</h1>
      <div className="min-w-4 flex-1" aria-hidden="true" />
      {children ? (
        <div className="flex flex-wrap items-center justify-end gap-2">{children}</div>
      ) : null}
    </div>
  );
}

export const toolbarBtnClass =
  "inline-flex items-center gap-2 rounded-full border border-deep-teal/25 px-4 py-2 text-sm font-medium text-deep-teal transition-colors hover:bg-deep-teal/5 disabled:opacity-50";

export const toolbarBtnPrimaryClass =
  "inline-flex items-center gap-2 rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white transition-opacity hover:opacity-90 disabled:opacity-50";
