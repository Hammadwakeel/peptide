import type { ReactNode } from "react";

const categoryPillClass =
  "max-w-[9rem] shrink-0 truncate rounded-full bg-deep-teal/8 px-2.5 py-1 text-[11px] font-light text-deep-teal/75";

export function ProductCardNameRow({
  name,
  category,
}: {
  name: ReactNode;
  category: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1">
      <div className="min-w-0 font-sans text-sm font-light leading-snug text-deep-teal">{name}</div>
      <span className={categoryPillClass}>{category}</span>
    </div>
  );
}

export function ProductCardStatsRow({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1 border-y border-deep-teal/8 py-3 text-sm">
      <div className="text-deep-teal/65">{left}</div>
      <div className="text-right text-deep-teal/65">{right}</div>
    </div>
  );
}

export function ProductCardActionRow({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3">
      <span className="text-sm text-deep-teal/65">{label}</span>
      <div className="flex items-center justify-end gap-2">{children}</div>
    </div>
  );
}

export function productCardBodyClass() {
  return "flex flex-1 flex-col gap-3 p-4";
}

export function productStatValue(value: ReactNode) {
  return <span className="font-light text-deep-teal">{value}</span>;
}
