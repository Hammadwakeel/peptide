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
