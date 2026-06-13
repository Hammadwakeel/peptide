/**
 * Typography system
 *
 * - Aspekta (font-sans): ~90% — UI, headings, body, dashboards
 * - Editorial / Fraunces (font-editorial): testimonials, quotes, taglines only
 * - JetBrains Mono (font-mono-tech): technical micro-data ≤12px (IDs, SKUs, tracking)
 */

/** Page & section headings — Aspekta 600 */
export const typePageTitle =
  "font-sans text-xl font-semibold text-deep-teal sm:text-2xl";

export const typeSectionTitle = "font-sans text-lg font-semibold text-deep-teal";

export const typeCardTitle = "font-sans text-xl font-semibold text-deep-teal";

/** Body — Aspekta 300/400 */
export const typeBody = "font-sans font-normal text-deep-teal";

export const typeBodyLight = "font-sans font-light text-deep-teal";

/** Large stat / metric display — Aspekta (not editorial mono) */
export const typeStatValue = "font-sans text-2xl font-semibold text-deep-teal";

export const typeStatValueLg = "font-sans text-3xl font-semibold text-deep-teal";

/** Section label — 12px, no scattered letter-spacing */
export const typeSectionLabel = "font-sans text-xs font-medium text-pacific-teal";

/** @deprecated Use typeSectionLabel */
export const typeEyebrow = typeSectionLabel;

/** Editorial — Fraunces, emotional / quote / tagline only */
export const typeEditorial = "font-editorial font-light";

export const typeTagline =
  "font-editorial text-xl font-light leading-snug sm:text-2xl";

/** Technical register — JetBrains, max 12px */
export const typeMonoTech = "font-mono text-xs";

export const typeMonoLabel = "font-mono text-[10px]";
