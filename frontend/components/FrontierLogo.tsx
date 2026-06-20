import Image from "next/image";
import {
  LOGO_ASSETS,
  LOGO_DIMENSIONS,
  LOGOMARK_ASSET,
  LOGOMARK_DIMENSIONS,
  type LogoVariant,
} from "@/lib/brand/logos";

type FrontierLogoProps = {
  /** white — dark surfaces · primary — teal · black — light/glass · secondary — coral accent */
  variant?: LogoVariant;
  /** Icon mark only — collapsed sidebar */
  compact?: boolean;
  className?: string;
  priority?: boolean;
};

export function FrontierLogo({
  variant = "primary",
  compact = false,
  className = "",
  priority = false,
}: FrontierLogoProps) {
  const src = LOGO_ASSETS[variant];

  if (compact) {
    return (
      <span className={`inline-flex h-9 w-9 overflow-hidden ${className}`}>
        <Image
          src={src}
          alt="Frontier Biomed"
          width={LOGO_DIMENSIONS.width}
          height={LOGO_DIMENSIONS.height}
          className="h-9 w-auto max-w-none shrink-0 object-left"
          priority={priority}
        />
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt="Frontier Biomed"
      width={LOGO_DIMENSIONS.width}
      height={LOGO_DIMENSIONS.height}
      className={`h-9 w-auto ${className}`}
      priority={priority}
    />
  );
}

type FrontierLogomarkProps = {
  className?: string;
  priority?: boolean;
};

/** Frontier logomark SVG — floating sidebar brand mark */
export function FrontierLogomark({
  className = "",
  priority = false,
}: FrontierLogomarkProps) {
  return (
    <span
      className={`inline-flex size-11 items-center justify-center overflow-hidden rounded-full border border-deep-teal/10 bg-pure-white p-1.5 shadow-[0_2px_8px_rgba(1,26,36,0.06)] ${className}`}
    >
      <Image
        src={LOGOMARK_ASSET}
        alt="Frontier Biomed"
        width={LOGOMARK_DIMENSIONS.width}
        height={LOGOMARK_DIMENSIONS.height}
        className="size-full object-contain"
        priority={priority}
      />
    </span>
  );
}
