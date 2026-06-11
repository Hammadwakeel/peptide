/** Frontier Biomed brand palette — use these tokens across UI and charts. */
export const BRAND_COLORS = {
  pacificTeal: "#0d717b",
  deepTeal: "#011a24",
  coralBlush: "#f7e1d9",
  pureWhite: "#ffffff",
} as const;

export const BRAND_RGB = {
  pacificTeal: "rgb(13, 113, 123)",
  deepTeal: "rgb(1, 26, 36)",
  coralBlush: "rgb(247, 225, 217)",
  pureWhite: "rgb(255, 255, 255)",
} as const;

export const BRAND_RGBA = {
  pacificTeal: "rgba(13, 113, 123, 1)",
  pacificTeal65: "rgba(13, 113, 123, 0.65)",
  pacificTeal35: "rgba(13, 113, 123, 0.35)",
  pacificTeal15: "rgba(13, 113, 123, 0.15)",
  pacificTeal08: "rgba(13, 113, 123, 0.08)",
  pacificTeal60: "rgba(13, 113, 123, 0.6)",
  deepTeal: "rgba(1, 26, 36, 1)",
  deepTealOverlay: "rgba(1, 26, 36, 0.6)",
  coralBlush: "rgba(247, 225, 217, 1)",
} as const;

export const DEFAULT_THEME_COLOR = BRAND_COLORS.pacificTeal;

/** Multi-series charts — opacity steps of pacific teal + coral accent. */
export const CHART_COLORS = [
  BRAND_COLORS.pacificTeal,
  BRAND_RGBA.pacificTeal65,
  BRAND_RGBA.pacificTeal35,
  BRAND_COLORS.coralBlush,
] as const;

export const CHART_GRID_STROKE = BRAND_RGBA.pacificTeal08;
export const CHART_AXIS_STROKE = "rgba(13, 113, 123, 0.13)";
export const CHART_TICK_FILL = BRAND_RGBA.pacificTeal60;

export const PROFIT_TIER_COLORS = {
  high: BRAND_COLORS.pacificTeal,
  medium: BRAND_RGBA.pacificTeal65,
  low: BRAND_RGBA.pacificTeal35,
} as const;

/** Rotating marketing / card surface classes (brand tints only). */
export const BRAND_SURFACE_CLASSES = [
  "bg-pacific-teal/8",
  "bg-coral-blush/55",
  "bg-pacific-teal/5",
  "bg-coral-blush/35",
] as const;
