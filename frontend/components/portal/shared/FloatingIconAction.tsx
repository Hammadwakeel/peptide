"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ICON_SIZE_MD, ICON_SIZE_SM } from "@/components/icons/frontier";
import { Tooltip } from "@/components/ui/Tippy";
import type { FrontierIconComponent } from "@/lib/icons/types";

const iconCircleBase =
  "relative flex size-11 shrink-0 items-center justify-center rounded-full transition-all duration-200";
const iconCircleActive =
  "border-2 border-deep-teal bg-pure-white text-deep-teal shadow-[0_2px_8px_rgba(1,26,36,0.12)]";
const iconCircleInactive =
  "border border-deep-teal/10 bg-pure-white text-deep-teal/55 shadow-[0_2px_8px_rgba(1,26,36,0.06)] hover:border-deep-teal/20 hover:text-deep-teal hover:shadow-[0_4px_12px_rgba(1,26,36,0.1)]";

function tooltipContent(label: string, Icon: FrontierIconComponent, badge?: number, active?: boolean) {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
      <Icon size={ICON_SIZE_MD} active={active} aria-hidden />
      <span>{label}</span>
      {badge && badge > 0 ? (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-pacific-teal text-[10px] font-light text-pure-white">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </span>
  );
}

function IconCircle({
  Icon,
  active,
  badge,
}: {
  Icon: FrontierIconComponent;
  active?: boolean;
  badge?: number;
}) {
  return (
    <span className={`${iconCircleBase} overflow-hidden ${active ? iconCircleActive : iconCircleInactive}`}>
      <Icon size={24} active={active} aria-hidden className="block object-contain object-center" />
      {badge && badge > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-pacific-teal text-[9px] font-light text-pure-white ring-2 ring-pure-white">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </span>
  );
}

type FloatingIconLinkProps = {
  href: string;
  label: string;
  icon: FrontierIconComponent;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
  className?: string;
  "data-tour"?: string;
};

export function FloatingIconLink({
  href,
  label,
  icon: Icon,
  active = false,
  badge,
  onClick,
  className = "",
  "data-tour": dataTour,
}: FloatingIconLinkProps) {
  return (
    <Tooltip content={tooltipContent(label, Icon, badge, active)} placement="right">
      <Link
        href={href}
        data-tour={dataTour}
        onClick={onClick}
        aria-label={label}
        className={`flex justify-center py-0.5 ${className}`}
      >
        <IconCircle Icon={Icon} active={active} badge={badge} />
      </Link>
    </Tooltip>
  );
}

type FloatingIconButtonProps = {
  label: string;
  icon: FrontierIconComponent;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function FloatingIconButton({
  label,
  icon: Icon,
  onClick,
  disabled = false,
  className = "",
  "aria-label": ariaLabel,
}: FloatingIconButtonProps) {
  return (
    <Tooltip content={tooltipContent(label, Icon)} placement="right">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel ?? label}
        className={`flex justify-center py-0.5 disabled:opacity-50 ${className}`}
      >
        <IconCircle Icon={Icon} />
      </button>
    </Tooltip>
  );
}

type FloatingToolbarActionProps = {
  label: string;
  icon: FrontierIconComponent;
  primary?: boolean;
  disabled?: boolean;
} & (
  | { href: string; onClick?: never }
  | { href?: never; onClick: () => void }
);

export function FloatingToolbarAction({
  label,
  icon: Icon,
  primary = false,
  disabled = false,
  href,
  onClick,
}: FloatingToolbarActionProps) {
  const circleClass = primary ? iconCircleActive : iconCircleInactive;

  const inner = (
    <span className={`${iconCircleBase} overflow-hidden ${circleClass}`}>
      <Icon size={ICON_SIZE_MD} active={primary} aria-hidden className="block object-contain object-center" />
    </span>
  );

  const wrapperClass = "flex justify-center py-0.5";

  if (href) {
    return (
      <Tooltip content={tooltipContent(label, Icon, undefined, primary)} placement="bottom">
        <Link href={href} aria-label={label} className={wrapperClass}>
          {inner}
        </Link>
      </Tooltip>
    );
  }

  return (
    <Tooltip content={tooltipContent(label, Icon)} placement="bottom">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`${wrapperClass} disabled:opacity-50`}
      >
        {inner}
      </button>
    </Tooltip>
  );
}

export function FloatingToolbarActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center justify-end gap-2">{children}</div>;
}

export { ICON_SIZE_SM, ICON_SIZE_MD };
