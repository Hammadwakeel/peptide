"use client";

import { useState } from "react";
import { ICON_SIZE_MD } from "@/components/icons/frontier";
import {
  frontierAssetIcons,
  frontierBrandAssetIcons,
  type FrontierAnyAssetIconKey,
  type FrontierAssetPaths,
} from "@/lib/icons/frontier-assets";
import type { FrontierIconComponent, FrontierIconProps } from "@/lib/icons/types";

const allAssetIcons: Record<FrontierAnyAssetIconKey, FrontierAssetPaths> = {
  ...frontierAssetIcons,
  ...frontierBrandAssetIcons,
};

type FrontierAssetIconProps = FrontierIconProps & {
  assetKey: FrontierAnyAssetIconKey;
  fallback: FrontierIconComponent;
};

export function FrontierAssetIcon({
  assetKey,
  fallback: Fallback,
  className = "",
  size = ICON_SIZE_MD,
  active = false,
  "aria-hidden": ariaHidden = true,
  role,
}: FrontierAssetIconProps) {
  const [useFallback, setUseFallback] = useState(false);
  const hidden = ariaHidden === true || ariaHidden === "true";
  const assets = allAssetIcons[assetKey];
  const src = active ? assets.active : assets.default;

  if (useFallback) {
    return (
      <Fallback
        className={className}
        size={size}
        active={active}
        aria-hidden={ariaHidden}
        role={role}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- brand PNG/SVG assets
    <img
      src={src}
      width={size}
      height={size}
      alt=""
      aria-hidden={hidden}
      role={role}
      className={`mx-auto block shrink-0 object-contain object-center pointer-events-none ${className}`}
      onError={() => {
        if (process.env.NODE_ENV === "development") {
          console.warn(`[FrontierAssetIcon] Missing asset: ${src} — using code fallback`);
        }
        setUseFallback(true);
      }}
    />
  );
}

export function createFrontierAssetIcon(
  assetKey: FrontierAnyAssetIconKey,
  fallback: FrontierIconComponent,
  displayName?: string,
): FrontierIconComponent {
  const Icon = (props: FrontierIconProps) => (
    <FrontierAssetIcon assetKey={assetKey} fallback={fallback} {...props} />
  );
  Icon.displayName = displayName ?? `FrontierAssetIcon_${assetKey}`;
  return Icon;
}

export function createFrontierBrandIcon(
  assetKey: keyof typeof frontierBrandAssetIcons,
  fallback: FrontierIconComponent,
  displayName?: string,
): FrontierIconComponent {
  return createFrontierAssetIcon(assetKey, fallback, displayName);
}
