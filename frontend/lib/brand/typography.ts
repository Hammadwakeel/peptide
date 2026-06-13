/**
 * Typography system
 *
 * - Aspekta (font-sans): ~90% — UI, headings, body, dashboards (light weight)
 * - Editorial / Fraunces (font-editorial): testimonials, quotes, taglines only
 * - JetBrains Mono (font-mono-tech): technical micro-data ≤12px (IDs, SKUs, tracking)
 */

/** Page & section headings — Aspekta light */
export const typePageTitle =
  "font-sans text-xl font-light text-deep-teal sm:text-2xl";

export const typeSectionTitle = "font-sans text-lg font-light text-deep-teal";

export const typeCardTitle = "font-sans text-xl font-light text-deep-teal";

/** Body — Aspekta light */
export const typeBody = "font-sans font-light text-deep-teal";

export const typeBodyLight = "font-sans font-extralight text-deep-teal";

/** Large stat / metric display */
export const typeStatValue = "font-sans text-2xl font-light text-deep-teal";

export const typeStatValueLg = "font-sans text-3xl font-light text-deep-teal";

/** Section label — 12px */
export const typeSectionLabel = "font-sans text-xs font-light text-pacific-teal";

/** @deprecated Use typeSectionLabel */
export const typeEyebrow = typeSectionLabel;

/** Editorial — Fraunces, emotional / quote / tagline only */
export const typeEditorial = "font-editorial font-extralight";

export const typeTagline =
  "font-editorial text-xl font-extralight leading-snug sm:text-2xl";

/** Technical register — JetBrains, max 12px */
export const typeMonoTech = "font-mono text-xs font-light";

export const typeMonoLabel = "font-mono text-[10px] font-light";
