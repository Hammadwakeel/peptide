"use client";

import { LayoutGroup, motion } from "framer-motion";
import type { PlatformFeature } from "@/lib/landing/platform-features";
import { PLATFORM_FEATURES } from "@/lib/landing/platform-features";

type PlatformProgressRailProps = {
  activeIndex: number;
  onSelect: (index: number) => void;
};

const layoutTransition = {
  layout: { type: "spring" as const, stiffness: 380, damping: 32 },
};

function boxClass(feature: PlatformFeature, index: number, activeIndex: number) {
  if (index <= activeIndex) return feature.railActiveClass;
  return feature.railInactiveClass;
}

type StepBoxProps = {
  index: number;
  activeIndex: number;
  onSelect: (index: number) => void;
};

function StepBox({ index, activeIndex, onSelect }: StepBoxProps) {
  const feature = PLATFORM_FEATURES[index];
  const stepNumber = index + 1;
  const isActive = index === activeIndex;

  return (
    <motion.button
      type="button"
      layout
      layoutId={`platform-step-${index}`}
      role="tab"
      aria-selected={isActive}
      aria-label={`Go to feature ${stepNumber}: ${feature.title}`}
      onClick={() => onSelect(index)}
      transition={layoutTransition}
      className={`flex size-8 shrink-0 items-center justify-center font-sans text-xs font-medium tabular-nums ${boxClass(feature, index, activeIndex)}`}
    >
      {stepNumber}
    </motion.button>
  );
}

export function PlatformProgressRail({
  activeIndex,
  onSelect,
}: PlatformProgressRailProps) {
  const leftIndices = PLATFORM_FEATURES.map((_, index) => index).slice(0, activeIndex + 1);
  const rightIndices = PLATFORM_FEATURES.map((_, index) => index).slice(activeIndex + 1);

  return (
    <div className="mt-8 shrink-0 sm:mt-10">
      <div className="relative h-px bg-deep-teal/10" aria-hidden />

      <LayoutGroup id="platform-progress-rail">
        <div
          className="mt-5 flex min-h-8 items-center justify-between gap-4"
          role="tablist"
          aria-label="Platform features"
          aria-live="polite"
        >
          <div className="flex min-h-8 items-center gap-2">
            {leftIndices.map((index) => (
              <StepBox
                key={PLATFORM_FEATURES[index].title}
                index={index}
                activeIndex={activeIndex}
                onSelect={onSelect}
              />
            ))}
          </div>

          <div className="flex min-h-8 items-center justify-end gap-2">
            {rightIndices.map((index) => (
              <StepBox
                key={PLATFORM_FEATURES[index].title}
                index={index}
                activeIndex={activeIndex}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </LayoutGroup>
    </div>
  );
}
