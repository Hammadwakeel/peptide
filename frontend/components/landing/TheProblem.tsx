"use client";

import { ScrollFocusHeading } from "@/components/landing/ScrollFocusText";
import { layoutContainerClass } from "@/components/landing/LandingSectionHeader";
import {
  fadeInUp,
  motion,
  slideInLeft,
  slideInRight,
  staggerContainer,
  transition,
  viewport,
} from "@/components/motion";
import { layoutSectionYClass } from "@/lib/brand/design-system";
import { LANDING_PROBLEM } from "@/lib/landing/content";

const bodySentences = LANDING_PROBLEM.body
  .split(/(?<=\.)\s+/)
  .filter(Boolean);

export function TheProblem() {
  return (
    <section
      id="problem"
      className={`relative overflow-hidden bg-deep-teal font-sans text-pure-white ${layoutSectionYClass}`}
      aria-label="The Problem"
    >
      <div className={`relative ${layoutContainerClass}`}>
        <motion.p
          className="font-sans text-xs font-light uppercase tracking-[0.04em] text-pacific-teal"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeInUp}
          transition={transition}
        >
          {LANDING_PROBLEM.label}
        </motion.p>

        <h2 className="sr-only">
          {LANDING_PROBLEM.titleLine1} {LANDING_PROBLEM.titleLine2}
        </h2>

        <div className="mt-4 grid gap-3 lg:mt-5 lg:grid-cols-2 lg:items-end lg:gap-10">
          <motion.p
            className="type-display text-balance text-pure-white"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={slideInLeft}
            transition={transition}
          >
            {LANDING_PROBLEM.titleLine1}
          </motion.p>

          <motion.div
            className="lg:text-right"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={slideInRight}
            transition={{ ...transition, delay: 0.08 }}
          >
            <ScrollFocusHeading
              as="h3"
              className="type-display text-pacific-teal"
              tone="dark"
            >
              {LANDING_PROBLEM.titleLine2}
            </ScrollFocusHeading>
          </motion.div>
        </div>

        <motion.div
          className="mt-10 max-w-2xl space-y-4 lg:mt-14"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer}
        >
          {bodySentences.map((sentence) => (
            <motion.p
              key={sentence}
              className="type-body-l text-pure-white/80 sm:text-lg"
              variants={fadeInUp}
              transition={transition}
            >
              {sentence}
            </motion.p>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
