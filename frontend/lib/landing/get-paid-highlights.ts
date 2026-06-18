import { shapeIntegrationCards } from "@/lib/brand/design-system";
import { LANDING_GET_PAID } from "@/lib/landing/content";
import type { LucideIcon } from "lucide-react";
import { CalendarClock, Percent, Tag } from "lucide-react";

export type GetPaidHighlight = {
  title: string;
  description: string;
  icon: LucideIcon;
  shapeClass: string;
  cardClass: string;
  iconClass: string;
  bodyClass: string;
};

const highlightIcons = [Tag, Percent, CalendarClock] as const;

const highlightStyles = [
  {
    shapeClass: shapeIntegrationCards[0],
    cardClass: "bg-[#606C71] text-pure-white",
    iconClass: "text-pure-white",
    bodyClass: "text-pure-white/85",
  },
  {
    shapeClass: shapeIntegrationCards[1],
    cardClass: "bg-[#7A72A8] text-pure-white",
    iconClass: "text-pure-white",
    bodyClass: "text-pure-white/85",
  },
  {
    shapeClass: shapeIntegrationCards[2],
    cardClass: "bg-[#50849E] text-pure-white",
    iconClass: "text-pure-white",
    bodyClass: "text-pure-white/85",
  },
] as const;

export const GET_PAID_HIGHLIGHTS: GetPaidHighlight[] = LANDING_GET_PAID.highlights.map(
  (highlight, index) => ({
    ...highlight,
    icon: highlightIcons[index] ?? Tag,
    ...highlightStyles[index],
  }),
);

export const GET_PAID_DASHBOARD_IMAGE = "/brand/product-mobile-dashboard.png";
