import Image from "next/image";
import {
  LOGO_ASSETS,
  LOGO_DIMENSIONS,
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
