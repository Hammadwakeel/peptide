/**
 * Frontier design system — dos & don'ts encoded as reusable tokens.
 *
 * Golden-ratio type steps from 12px base: 12 → 20 → 32 → 48 (rounded integers).
 */

/** Shared horizontal rhythm — logo, hero copy, and CTAs align to this grid */
export const layoutContainerClass =
  "mx-auto w-full max-w-[1400px] px-4 sm:px-8 md:px-12 lg:px-20";

export const layoutSectionYClass = "py-14 sm:py-20 lg:py-24";

export { typeSectionLabel } from "@/lib/brand/typography";

/** 48px display — section heroes (not 7xl/8xl) */
export const typeDisplayTitle =
  "font-sans text-3xl font-semibold leading-[1.1] text-deep-teal sm:text-4xl lg:text-5xl";

/** Onboarding / guide title — 48px at lg */
export const typeGuideTitle =
  "font-sans text-3xl font-semibold leading-tight text-deep-teal sm:text-4xl lg:text-[3rem]";

/** 12px guide subtitle */
export const typeGuideSubtitle = "font-sans text-sm font-normal leading-relaxed text-deep-teal/60";

/** Primary CTA — smooth teal fade, no border stroke on hover */
export const btnPrimaryClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-deep-teal px-5 py-2.5 text-sm font-medium text-pure-white transition-[background-color,opacity] duration-300 ease-out hover:bg-pacific-teal disabled:opacity-50";

/** Ghost / secondary — background fade only, no dark hover border */
export const btnGhostClass =
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-deep-teal transition-[background-color,color] duration-300 ease-out hover:bg-pacific-teal/12 hover:text-pacific-teal disabled:opacity-50";

/** Outline shell — static subtle border, hover fills softly */
export const btnOutlineClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-deep-teal/15 bg-pure-white px-4 py-2 text-sm font-medium text-deep-teal transition-[background-color,color,border-color] duration-300 ease-out hover:border-transparent hover:bg-pacific-teal/12 hover:text-pacific-teal disabled:opacity-50";

/** Editorial container shapes — asymmetric radii inspired by pharma editorial layouts */
export const shapePortraitShowcase =
  "rounded-tl-[4.5rem] rounded-tr-2xl rounded-br-[3.25rem] rounded-bl-xl sm:rounded-tl-[6.5rem] sm:rounded-tr-3xl sm:rounded-br-[4.75rem] sm:rounded-bl-2xl";

export const shapePortraitClipPath = {
  clipPath:
    "polygon(50% 0%, 82% 10%, 100% 38%, 90% 72%, 50% 100%, 10% 72%, 0% 38%, 18% 10%)",
} as const;

export const shapeStadiumCapsule = "rounded-[9999px]";

/** Wide horizontal CTA — large TL + BR, small TR + BL (diagonal editorial sweep) */
export const shapeCtaBanner =
  "rounded-tl-[5rem] rounded-tr-xl rounded-br-[5rem] rounded-bl-xl sm:rounded-tl-[7rem] sm:rounded-tr-2xl sm:rounded-br-[7rem] sm:rounded-bl-2xl lg:rounded-tl-[9.5rem] lg:rounded-tr-[1.75rem] lg:rounded-br-[9.5rem] lg:rounded-bl-[1.75rem]";

export const shapeIntegrationCards = [
  "rounded-tl-[2.75rem] rounded-tr-xl rounded-br-2xl rounded-bl-[1.5rem] sm:rounded-tl-[3.25rem] sm:rounded-br-[2.5rem]",
  "rounded-tl-xl rounded-tr-[2.75rem] rounded-br-[1.5rem] rounded-bl-2xl sm:rounded-tr-[3.25rem] sm:rounded-bl-[2.5rem]",
  "rounded-tl-2xl rounded-tr-2xl rounded-br-[2.75rem] rounded-bl-xl sm:rounded-br-[3.25rem]",
  "rounded-tl-[1.5rem] rounded-tr-2xl rounded-br-xl rounded-bl-[2.75rem] sm:rounded-bl-[3.25rem]",
] as const;

/** Standards metric cards — distinct diagonal / corner-accent shapes */
export const shapeStandardsCards = [
  "rounded-tl-[3.25rem] rounded-tr-xl rounded-br-[3.25rem] rounded-bl-xl sm:rounded-tl-[4rem] sm:rounded-br-[4rem]",
  "rounded-tl-xl rounded-tr-[3.25rem] rounded-br-xl rounded-bl-[3.25rem] sm:rounded-tr-[4rem] sm:rounded-bl-[4rem]",
  "rounded-tl-[4rem] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl sm:rounded-tl-[5rem] sm:rounded-tr-3xl",
  "rounded-tl-2xl rounded-tr-2xl rounded-br-[4rem] rounded-bl-xl sm:rounded-br-[5rem] sm:rounded-bl-2xl",
] as const;

/** Verification process step cards — three unique editorial shapes */
export const shapeProcessCards = [
  "rounded-tl-[3.5rem] rounded-tr-2xl rounded-br-xl rounded-bl-[2.75rem] sm:rounded-tl-[4.25rem] sm:rounded-bl-[3.25rem]",
  "rounded-tl-2xl rounded-tr-[3.5rem] rounded-br-[2.75rem] rounded-bl-xl sm:rounded-tr-[4.25rem] sm:rounded-br-[3.25rem]",
  "rounded-tl-xl rounded-tr-xl rounded-br-[3.5rem] rounded-bl-[3.5rem] sm:rounded-br-[4.25rem] sm:rounded-bl-[4.25rem]",
] as const;

/** Hero headline + CTA cards — two distinct editorial shapes */
export const shapeHeroCards = [
  "rounded-tl-[4rem] rounded-tr-2xl rounded-br-[3rem] rounded-bl-xl sm:rounded-tl-[5.5rem] sm:rounded-tr-3xl sm:rounded-br-[4rem] sm:rounded-bl-2xl",
  "rounded-tl-2xl rounded-tr-[3.5rem] rounded-br-[4rem] rounded-bl-2xl sm:rounded-tr-[4.25rem] sm:rounded-br-[5rem] sm:rounded-bl-3xl",
] as const;
