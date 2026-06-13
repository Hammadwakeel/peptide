"use client";

import { ScrollFocusHeading } from "@/components/landing/ScrollFocusText";
import {
  layoutContainerClass,
  typeDisplayTitle,
  typeSectionLabel,
} from "@/lib/brand/design-system";
import { fadeInUp, motion, transition, viewport } from "@/components/motion";

type LandingSectionHeaderProps = {
  label: string;
  title: React.ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function LandingSectionHeader({
  label,
  title,
  align = "center",
  className = "",
}: LandingSectionHeaderProps) {
  return (
    <motion.div
      className={`mb-10 sm:mb-16 ${align === "center" ? "text-center" : "text-left"} ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeInUp}
      transition={transition}
    >
      <p className={typeSectionLabel}>{label}</p>
      <ScrollFocusHeading as="h2" className={`mt-3 ${typeDisplayTitle}`} tone="light">
        {title}
      </ScrollFocusHeading>
    </motion.div>
  );
}

export { layoutContainerClass };
