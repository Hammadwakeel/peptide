"use client";

import { layoutContainerClass } from "@/components/landing/LandingSectionHeader";
import { ScrollFocusHeading } from "@/components/landing/ScrollFocusText";
import {
  fadeInUp,
  motion,
  slideInLeft,
  slideInRight,
  staggerContainer,
  transition,
  viewport,
} from "@/components/motion";
import { layoutSectionYClass, typeDisplayTitle, typeSectionLabel } from "@/lib/brand/design-system";
import { LANDING_VERIFIED_SAFETY } from "@/lib/landing/content";

const bodySentences = LANDING_VERIFIED_SAFETY.body
  .split(/(?<=\.)\s+/)
  .filter(Boolean);

export function VerifiedSafety() {
  return (
    <section
      id="safety"
      className={`relative overflow-hidden bg-pure-white ${layoutSectionYClass}`}
      aria-labelledby="verified-safety-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-pacific-teal/8 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-deep-teal/6 blur-3xl" />
      </div>

      <div className={`relative ${layoutContainerClass}`}>
        <motion.p
          id="verified-safety-heading"
          className={typeSectionLabel}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeInUp}
          transition={transition}
        >
          {LANDING_VERIFIED_SAFETY.label}
        </motion.p>

        <div className="mt-4 grid gap-8 lg:mt-6 lg:grid-cols-2 lg:items-start lg:gap-12 xl:gap-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={slideInLeft}
            transition={transition}
          >
            <ScrollFocusHeading
              as="h2"
              className={`${typeDisplayTitle} text-balance`}
              tone="light"
            >
              {LANDING_VERIFIED_SAFETY.lead}
            </ScrollFocusHeading>
          </motion.div>

          <motion.div
            className="max-w-xl lg:pt-2"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={staggerContainer}
          >
            {bodySentences.map((sentence) => (
              <motion.p
                key={sentence}
                className="type-body-l text-deep-teal/80 sm:text-lg [&+&]:mt-4"
                variants={slideInRight}
                transition={transition}
              >
                {sentence}
              </motion.p>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="mt-10 h-px bg-gradient-to-r from-pacific-teal/25 via-deep-teal/10 to-transparent sm:mt-14"
          initial={{ scaleX: 0, originX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={viewport}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        />
      </div>
    </section>
  );
}
