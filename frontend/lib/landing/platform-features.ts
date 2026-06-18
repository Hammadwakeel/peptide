import { shapeProcessCards } from "@/lib/brand/design-system";
import { LANDING_PLATFORM } from "@/lib/landing/content";

export type PlatformFeature = {
  title: string;
  description: string;
  cardClass: string;
  titleClass: string;
  bodyClass: string;
  shapeClass: string;
  railActiveClass: string;
  railInactiveClass: string;
};

/** Platform carousel cards — palette: slate, lavender, steel blue, seafoam teal */
const featureStyles = [
  {
    cardClass: "bg-[#606C71] text-pure-white",
    titleClass: "text-pure-white",
    bodyClass: "text-pure-white/85",
    shapeClass: shapeProcessCards[0],
    railActiveClass: "bg-[#606C71] text-pure-white",
    railInactiveClass: "bg-[#606C71]/20 text-[#606C71]/55",
  },
  {
    cardClass: "bg-[#7A72A8] text-pure-white",
    titleClass: "text-pure-white",
    bodyClass: "text-pure-white/85",
    shapeClass: shapeProcessCards[1],
    railActiveClass: "bg-[#7A72A8] text-pure-white",
    railInactiveClass: "bg-[#7A72A8]/20 text-[#7A72A8]/55",
  },
  {
    cardClass: "bg-[#50849E] text-pure-white",
    titleClass: "text-pure-white",
    bodyClass: "text-pure-white/85",
    shapeClass: shapeProcessCards[2],
    railActiveClass: "bg-[#50849E] text-pure-white",
    railInactiveClass: "bg-[#50849E]/20 text-[#50849E]/55",
  },
  {
    cardClass: "bg-[#468E93] text-pure-white",
    titleClass: "text-pure-white",
    bodyClass: "text-pure-white/85",
    shapeClass: shapeProcessCards[3],
    railActiveClass: "bg-[#468E93] text-pure-white",
    railInactiveClass: "bg-[#468E93]/20 text-[#468E93]/55",
  },
] as const;

export const PLATFORM_FEATURES: PlatformFeature[] = LANDING_PLATFORM.features.map(
  (feature, index) => ({
    ...feature,
    ...featureStyles[index],
  }),
);

/** Vertical scroll length per feature transition (viewport units) */
export const PLATFORM_SCROLL_VH_PER_STEP = 75;
