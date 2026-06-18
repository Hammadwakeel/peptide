import { shapeProcessCards } from "@/lib/brand/design-system";
import { LANDING_HOW_IT_WORKS } from "@/lib/landing/content";
import type { LucideIcon } from "lucide-react";
import { ClipboardList, Stethoscope, Truck } from "lucide-react";

export type HowItWorksStep = {
  title: string;
  description: string;
  step: string;
  icon: LucideIcon;
  shapeClass: string;
  accentClass: string;
  iconWrapClass: string;
};

const stepIcons = [ClipboardList, Stethoscope, Truck] as const;

const stepStyles = [
  {
    shapeClass: shapeProcessCards[0],
    accentClass: "bg-[#606C71] text-pure-white",
    iconWrapClass: "bg-[#606C71]/10 text-[#606C71]",
  },
  {
    shapeClass: shapeProcessCards[1],
    accentClass: "bg-[#7A72A8] text-pure-white",
    iconWrapClass: "bg-[#7A72A8]/12 text-[#7A72A8]",
  },
  {
    shapeClass: shapeProcessCards[2],
    accentClass: "bg-[#50849E] text-pure-white",
    iconWrapClass: "bg-[#50849E]/12 text-[#50849E]",
  },
] as const;

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = LANDING_HOW_IT_WORKS.steps.map(
  (step, index) => ({
    ...step,
    step: String(index + 1).padStart(2, "0"),
    icon: stepIcons[index] ?? ClipboardList,
    ...stepStyles[index],
  }),
);
