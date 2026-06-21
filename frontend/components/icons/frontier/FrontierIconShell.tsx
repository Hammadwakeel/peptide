"use client";

import { ICON_BASE, ICON_OVERLAY } from "@/lib/icons/colors";
import type { FrontierIconPaths, FrontierIconProps } from "@/lib/icons/types";

type FrontierIconShellProps = FrontierIconProps & {
  paths: FrontierIconPaths;
};

export function FrontierIconShell({
  paths,
  className = "",
  size = 24,
  active = false,
  "aria-hidden": ariaHidden = true,
  role,
}: FrontierIconShellProps) {
  const hidden = ariaHidden === true || ariaHidden === "true";
  const filterId = `frontier-frost-${paths.base.slice(0, 8).replace(/\W/g, "")}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      aria-hidden={hidden}
      role={role}
    >
      {active ? (
        <>
          <path fill={ICON_BASE} d={paths.base} />
          <path fill={ICON_OVERLAY} d={paths.overlay} />
        </>
      ) : (
        <>
          <defs>
            <filter
              id={filterId}
              x="-25%"
              y="-25%"
              width="150%"
              height="150%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur in="BackgroundImage" stdDeviation="2.8" result="blurred" />
              <feFlood floodColor={ICON_OVERLAY} floodOpacity="0.35" result="tint" />
              <feComposite in="tint" in2="blurred" operator="in" result="tintedBlur" />
              <feComposite in="SourceGraphic" in2="tintedBlur" operator="over" />
            </filter>
          </defs>
          <path fill={ICON_BASE} d={paths.base} />
          <path
            fill={ICON_OVERLAY}
            fillOpacity={0.85}
            d={paths.overlay}
            filter={`url(#${filterId})`}
          />
        </>
      )}
    </svg>
  );
}
