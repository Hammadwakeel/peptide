import { shapeStandardsCards } from "@/lib/brand/design-system";
import { LANDING_CATALOG } from "@/lib/landing/content";

export type CatalogStat = {
  value: string;
  label: string;
  cardClass: string;
  dividerClass: string;
  bodyClass: string;
  shapeClass: string;
};

const statStyles = [
  {
    cardClass: "bg-[#606C71] text-pure-white",
    dividerClass: "bg-pure-white/30",
    bodyClass: "text-pure-white/85",
    shapeClass: shapeStandardsCards[0],
  },
  {
    cardClass: "bg-[#7A72A8] text-pure-white",
    dividerClass: "bg-pure-white/30",
    bodyClass: "text-pure-white/85",
    shapeClass: shapeStandardsCards[1],
  },
  {
    cardClass: "bg-[#50849E] text-pure-white",
    dividerClass: "bg-pure-white/30",
    bodyClass: "text-pure-white/85",
    shapeClass: shapeStandardsCards[2],
  },
] as const;

export const CATALOG_STATS: CatalogStat[] = LANDING_CATALOG.stats.map((stat, index) => ({
  ...stat,
  ...statStyles[index],
}));

export const CATALOG_CATEGORIES = LANDING_CATALOG.categories;
