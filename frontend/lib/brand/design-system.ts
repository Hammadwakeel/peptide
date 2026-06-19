/**
 * Frontier design system — dos & don'ts encoded as reusable tokens.
 *
 * Golden-ratio type steps from 12px base: 12 → 20 → 32 → 48 (rounded integers).
 */

/** Shared horizontal rhythm — logo, hero card, and nav align to this grid */
export const landingTopShellClass = "w-full px-4 sm:px-6";

export const landingTopRailClass = "mx-auto w-full max-w-[1440px]";

/** Shared horizontal rhythm — logo, hero copy, and CTAs align to this grid */
export const layoutContainerClass =
  "mx-auto w-full max-w-[1400px] px-4 sm:px-8 md:px-12 lg:px-20";

export const layoutSectionYClass = "py-14 sm:py-20 lg:py-24";

export { typeSectionLabel } from "@/lib/brand/typography";

/** Display · light — marketing hero & section statements (guide Display tier) */
export const typeDisplayTitle = "type-display text-deep-teal";

/** Section header · H2 · 600 — functional section headings */
export const typeSectionHeading = "type-h2 text-deep-teal";

/** Onboarding / guide title — H1 · 800 (guide page-title tier) */
export const typeGuideTitle = "type-h1 text-deep-teal";

/** Guide subtitle — Body L · 400 */
export const typeGuideSubtitle = "type-body-l text-deep-teal/60";

/** Primary CTA — smooth teal fade, no border stroke on hover */
export const btnPrimaryClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-deep-teal px-5 py-2.5 text-sm font-light text-pure-white transition-[background-color,opacity] duration-300 ease-out hover:bg-pacific-teal disabled:opacity-50";

/** Ghost / secondary — background fade only, no dark hover border */
export const btnGhostClass =
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-light text-deep-teal transition-[background-color,color] duration-300 ease-out hover:bg-pacific-teal/12 hover:text-pacific-teal disabled:opacity-50";

/** Outline shell — static subtle border, hover fills softly */
export const btnOutlineClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-deep-teal/15 bg-pure-white px-4 py-2 text-sm font-light text-deep-teal transition-[background-color,color,border-color] duration-300 ease-out hover:border-transparent hover:bg-pacific-teal/12 hover:text-pacific-teal disabled:opacity-50";

/** iOS glass — panels over photo/video (see globals.css .glass-ios) */
export const glassPanelClass = "glass-ios glass-ios-panel";

/** Frosted glass panel on light section backgrounds */
export const glassPanelOnLightClass =
  "glass-ios glass-ios-panel !border-deep-teal/12 !bg-white/40";

/** @deprecated Prefer single glass-ios panel; kept for legacy nested usage */
export const glassPanelInnerClass = "glass-ios glass-ios-panel !bg-pure-white/[0.04]";

/** Universal landing pill height */
export const landingPillHeightClass = "h-10";

/** Center nav glass cart */
export const landingNavShellClass = "inline-flex items-center gap-0.5 p-1 lg:gap-1 lg:p-1.5";

/** Nav link inside center glass cart */
export const landingNavLinkClass =
  "relative inline-flex items-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-light leading-none transition-colors duration-300";

/** Center nav links pill over hero video */
export const glassNavLinksClass = "glass-ios glass-ios-nav !rounded-full";

/** Floating navbar shell over hero video */
export const glassNavShellClass = glassNavLinksClass;

/** Onboard CTA — universal pill size (navbar + hero) */
export const glassOnboardCtaClass =
  `glass-ios-button group relative z-[1] inline-flex ${landingPillHeightClass} items-center gap-2 rounded-full pl-4 pr-1 text-sm font-light leading-none text-pure-white lg:pl-5 lg:pr-1`;

/** Ghost glass CTA — same height as onboard */
export const glassCtaGhostOnMediaClass =
  `group relative z-[1] inline-flex ${landingPillHeightClass} items-center justify-center rounded-full border border-pure-white/22 bg-pure-white/[0.06] px-4 text-sm font-light leading-none text-pure-white/90 backdrop-blur-[16px] transition-[background-color,border-color] duration-300 hover:border-pure-white/32 hover:bg-pure-white/12 hover:text-pure-white lg:px-5`;

/** Onboard CTA on light backgrounds */
export const glassOnboardCtaOnLightClass =
  `group inline-flex ${landingPillHeightClass} items-center gap-2 rounded-full bg-pure-white pl-4 pr-1 text-sm font-light leading-none text-deep-teal transition-[background-color,box-shadow] duration-300 hover:bg-coral-blush hover:shadow-[0_16px_40px_rgba(1,26,36,0.2)] lg:gap-2.5 lg:pl-5 lg:pr-1`;

/** @deprecated Use glassOnboardCtaClass */
export const glassNavCtaClass = glassOnboardCtaClass;

/** @deprecated Use glassOnboardCtaClass */
export const glassCtaOnMediaClass = glassOnboardCtaClass;

/** Glass CTA — on light frosted panels */
export const glassCtaClass =
  "glass-ios-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-light text-deep-teal sm:px-8 sm:py-4 sm:text-base";

/** Navbar after scrolling past the hero */
export const navSolidShellClass = "glass-ios-solid glass-ios-nav !rounded-full";

/** Glass dropdown for mobile nav */
export const glassNavMenuClass = "glass-ios glass-ios-menu";

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

/** Platform feature cards — four editorial shapes */
export const shapeProcessCards = [
  "rounded-tl-[3.5rem] rounded-tr-2xl rounded-br-xl rounded-bl-[2.75rem] sm:rounded-tl-[4.25rem] sm:rounded-bl-[3.25rem]",
  "rounded-tl-2xl rounded-tr-[3.5rem] rounded-br-[2.75rem] rounded-bl-xl sm:rounded-tr-[4.25rem] sm:rounded-br-[3.25rem]",
  "rounded-tl-xl rounded-tr-xl rounded-br-[3.5rem] rounded-bl-[3.5rem] sm:rounded-br-[4.25rem] sm:rounded-bl-[4.25rem]",
  "rounded-tl-[2.75rem] rounded-tr-xl rounded-br-2xl rounded-bl-[1.5rem] sm:rounded-tl-[3.25rem] sm:rounded-br-[2.5rem]",
] as const;

/** Hero headline + CTA cards — two distinct editorial shapes */
export const shapeHeroCards = [
  "rounded-tl-[4rem] rounded-tr-2xl rounded-br-[3rem] rounded-bl-xl sm:rounded-tl-[5.5rem] sm:rounded-tr-3xl sm:rounded-br-[4rem] sm:rounded-bl-2xl",
  "rounded-tl-2xl rounded-tr-[3.5rem] rounded-br-[4rem] rounded-bl-2xl sm:rounded-tr-[4.25rem] sm:rounded-br-[5rem] sm:rounded-bl-3xl",
] as const;
