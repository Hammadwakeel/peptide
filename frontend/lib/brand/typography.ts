/**
 * Typography system — three-voice brand guide (sections 5.1–5.5).
 *
 * - Aspekta (font-sans): PRIMARY. The default for everything — UI, headings,
 *   body, labels, dashboards. Weight scale per guide 5.4:
 *     Display·300 · H1·800 · H2·600 · H3·500 · H4·500 · Body L·400 ·
 *     Body S·300 · Micro·400.
 * - Fraunces (font-editorial): SECONDARY. Display/editorial only, ≥28px,
 *   no italic, Thin–Regular weights only. Never used below 28px or in UI chrome.
 * - JetBrains Mono (font-mono): TERTIARY. Technical data only (IDs, SKUs,
 *   lot/tracking numbers), ≤14px.
 *
 * Prefer the locked `.type-*` utilities (defined in globals.css) which bundle
 * size + weight + leading + tracking per tier. The tokens below compose them
 * with brand color so they can be dropped onto any element.
 */

/* ------------------------------------------------------------------ */
/* Aspekta weight scale                                                */
/* ------------------------------------------------------------------ */

/** Display · 72px · light — hero statements */
export const typeDisplay = "type-display text-deep-teal";

/**
 * H1 · 800 — page titles. Uses the guide's H1 weight at a chrome-appropriate
 * size (full 48px H1 tier is `typeGuideTitle` / `.type-h1`, for hero titles).
 */
export const typePageTitle =
  "font-sans text-xl font-extrabold tracking-[-0.01em] text-deep-teal sm:text-2xl";

/** H2 · 600 — section headers (chrome-scaled) */
export const typeSectionTitle =
  "font-sans text-lg font-semibold tracking-[-0.01em] text-deep-teal";

/** H3 · 500 — sub-headers / card titles */
export const typeCardTitle = "font-sans text-xl font-medium text-deep-teal";

export const typeSubTitle = "font-sans text-base font-medium text-deep-teal";

/** H4 · 18px · 500 — callout labels */
export const typeCalloutLabel = "type-h4 text-deep-teal";

/** Body L · 16px · 400 — primary body */
export const typeBody = "type-body-l text-deep-teal";

/** Body L, dimmed — secondary prose */
export const typeBodyMuted = "type-body-l text-deep-teal/70";

/** Body S · 12px · 300 — footnotes */
export const typeBodySmall = "type-body-s text-deep-teal/70";

/** @deprecated Body weights are 400 (Body L) / 300 (Body S) per guide. */
export const typeBodyLight = "type-body-s text-deep-teal";

/** Micro · 10px · 400 — compliance / fine print */
export const typeMicro = "type-micro text-deep-teal/55";

/** Large stat / metric display — H2 weight for figures */
export const typeStatValue = "font-sans text-2xl font-semibold text-deep-teal";

export const typeStatValueLg = "type-h1 text-deep-teal";

/** Section label — 12px eyebrow (Body S weight, teal) */
export const typeSectionLabel =
  "font-sans text-xs font-light uppercase tracking-[0.04em] text-pacific-teal";

/** @deprecated Use typeSectionLabel */
export const typeEyebrow = typeSectionLabel;

/* ------------------------------------------------------------------ */
/* Fraunces editorial display — display only, ≥28px                    */
/* ------------------------------------------------------------------ */

/** Light · 60px — largest editorial display */
export const typeEditorialDisplay = "type-editorial-display";

/** Light · 40px — primary editorial */
export const typeEditorial = "type-editorial-primary";

/** Regular · 28px — editorial ceiling (minimum Fraunces size) */
export const typeEditorialCeiling = "type-editorial-ceiling";

/** Tagline — small taglines stay in Aspekta (Fraunces never below 28px). */
export const typeTagline =
  "font-sans text-xl font-extralight leading-snug sm:text-2xl";

/* ------------------------------------------------------------------ */
/* JetBrains Mono technical register — ≤14px                           */
/* ------------------------------------------------------------------ */

/** Bold · 12px — field labels */
export const typeMonoLabel = "type-mono-label uppercase";

/** Regular · 13px — data values */
export const typeMonoValue = "type-mono-value";

/** Regular · 11px — compliance footer */
export const typeMonoFooter = "type-mono-footer";

/** @deprecated Use typeMonoValue / typeMonoLabel */
export const typeMonoTech = "type-mono-value";
