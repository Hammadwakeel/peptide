"use client";

import { ScrollFocusHeading, type ScrollFocusTone } from "@/components/landing/ScrollFocusText";
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
  tone?: ScrollFocusTone;
};

export function LandingSectionHeader({
  label,
  title,
  align = "center",
  className = "",
  tone = "light",
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
      <p
        className={
          tone === "dark"
            ? "font-sans text-xs font-light uppercase tracking-[0.04em] text-pure-white/55"
            : typeSectionLabel
        }
      >
        {label}
      </p>
      <ScrollFocusHeading
        as="h2"
        className={`mt-3 ${tone === "dark" ? "type-display text-pure-white" : typeDisplayTitle}`}
        tone={tone}
      >
        {title}
      </ScrollFocusHeading>
    </motion.div>
  );
}

export { layoutContainerClass };
