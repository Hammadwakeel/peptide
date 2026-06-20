/** Official Frontier Biomed logotypes — use these paths only. */
export const LOGO_ASSETS = {
  white: "/assets/logo/frontier-logotype-white.png",
  primary: "/assets/logo/frontier-logotype-primary.png",
  black: "/assets/logo/frontier-logotype-black.png",
  secondary: "/assets/logo/frontier-logotype-secondary.png",
} as const;

export type LogoVariant = keyof typeof LOGO_ASSETS;

export const LOGO_DIMENSIONS = {
  width: 1946,
  height: 448,
} as const;

/** Square Frontier logomark — sidebar and compact brand surfaces */
export const LOGOMARK_ASSET = "/logos/Frontier logomark primary.svg" as const;

export const LOGOMARK_DIMENSIONS = {
  width: 1907,
  height: 1353,
} as const;
