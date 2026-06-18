"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { LandingSectionHeader, layoutContainerClass } from "@/components/landing/LandingSectionHeader";
import { layoutSectionYClass } from "@/lib/brand/design-system";
import { LANDING_PLATFORM } from "@/lib/landing/content";
import {
  PLATFORM_FEATURES,
  PLATFORM_SCROLL_VH_PER_STEP,
} from "@/lib/landing/platform-features";
import { PlatformFeatureCard } from "@/components/landing/platform/PlatformFeatureCard";
import { PlatformProgressRail } from "@/components/landing/platform/PlatformProgressRail";

const CARD_GAP_PX = 24;

function PlatformStaticGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:gap-8">
      {PLATFORM_FEATURES.map((feature) => (
        <article
          key={feature.title}
          className={`flex flex-col p-6 sm:p-8 ${feature.shapeClass} ${feature.cardClass}`}
        >
          <h3 className={`font-sans text-xl font-medium sm:text-2xl ${feature.titleClass}`}>
            {feature.title}
          </h3>
          <p className={`mt-3 text-sm leading-7 sm:mt-4 sm:text-base ${feature.bodyClass}`}>
            {feature.description}
          </p>
        </article>
      ))}
    </div>
  );
}

export function PlatformFeaturesCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardStride, setCardStride] = useState(0);

  const featureCount = PLATFORM_FEATURES.length;
  const scrollHeightVh =
    featureCount <= 1 ? 100 : 100 + (featureCount - 1) * PLATFORM_SCROLL_VH_PER_STEP;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -cardStride * Math.max(featureCount - 1, 0)],
  );

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (featureCount <= 1) {
      setActiveIndex(0);
      return;
    }

    const index = Math.min(
      featureCount - 1,
      Math.max(0, Math.round(progress * (featureCount - 1))),
    );
    setActiveIndex(index);
  });

  const measureStride = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const firstCard = track.querySelector<HTMLElement>("[data-platform-card]");
    if (!firstCard) return;
    setCardStride(firstCard.offsetWidth + CARD_GAP_PX);
  }, []);

  useEffect(() => {
    measureStride();
    const track = trackRef.current;
    if (!track) return;

    const observer = new ResizeObserver(measureStride);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measureStride]);

  const scrollToFeature = useCallback(
    (index: number) => {
      const container = containerRef.current;
      if (!container || featureCount <= 1) return;

      const rect = container.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const scrollable = container.offsetHeight - window.innerHeight;
      const progress = index / (featureCount - 1);
      const target = sectionTop + scrollable * progress;

      window.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
    },
    [featureCount, reduceMotion],
  );

  const activeFeature = PLATFORM_FEATURES[activeIndex];

  return (
    <div
      ref={containerRef}
      className={`relative bg-pure-white ${layoutSectionYClass}`}
      style={{ height: reduceMotion ? undefined : `${scrollHeightVh}vh` }}
    >
      <div
        className={
          reduceMotion
            ? layoutContainerClass
            : `sticky top-0 flex h-dvh flex-col overflow-hidden ${layoutContainerClass} py-10 sm:py-14 lg:py-16`
        }
      >
        <LandingSectionHeader
          align="left"
          label={LANDING_PLATFORM.label}
          title={LANDING_PLATFORM.title}
          className="relative z-20 mb-8 shrink-0 sm:mb-10"
        />

        {reduceMotion ? (
          <PlatformStaticGrid />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col justify-center">
            <div className="relative isolate w-full min-w-0 overflow-hidden">
              <div
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-pure-white to-transparent sm:w-20"
                aria-hidden
              />

              <motion.div
                ref={trackRef}
                style={{ x }}
                className="flex w-max items-center gap-6 will-change-transform"
              >
                {PLATFORM_FEATURES.map((feature, index) => (
                  <PlatformFeatureCard
                    key={feature.title}
                    feature={feature}
                    isActive={index === activeIndex}
                  />
                ))}
              </motion.div>
            </div>

            <div className="relative z-20 mt-8 min-h-[5.5rem] sm:mt-10 sm:min-h-[6rem]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeFeature.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-xl text-sm leading-7 text-deep-teal/70 sm:text-base"
                >
                  {activeFeature.description}
                </motion.p>
              </AnimatePresence>
            </div>

            <PlatformProgressRail activeIndex={activeIndex} onSelect={scrollToFeature} />
          </div>
        )}
      </div>
    </div>
  );
}
