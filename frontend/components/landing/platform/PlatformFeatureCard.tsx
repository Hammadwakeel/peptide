"use client";

import { motion } from "@/components/motion";
import type { PlatformFeature } from "@/lib/landing/platform-features";

type PlatformFeatureCardProps = {
  feature: PlatformFeature;
  isActive: boolean;
};

export function PlatformFeatureCard({ feature, isActive }: PlatformFeatureCardProps) {
  return (
    <motion.article
      data-platform-card
      aria-current={isActive ? "step" : undefined}
      initial={false}
      animate={{
        x: isActive ? 0 : 28,
        filter: isActive ? "blur(0px)" : "blur(8px)",
        opacity: isActive ? 1 : 0.5,
        scale: isActive ? 1 : 0.95,
      }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative shrink-0"
    >
      <div
        className={`relative flex h-[200px] w-[min(72vw,280px)] items-center justify-center px-6 transition-[box-shadow,filter] duration-500 sm:h-[240px] sm:w-[320px] lg:h-[280px] lg:w-[380px] ${feature.shapeClass} ${feature.cardClass} ${
          isActive ? "shadow-md" : ""
        }`}
      >
        <h3
          className={`text-center font-sans text-lg font-medium tracking-[-0.01em] sm:text-xl lg:text-2xl ${feature.titleClass}`}
        >
          {feature.title}
        </h3>
      </div>
    </motion.article>
  );
}
