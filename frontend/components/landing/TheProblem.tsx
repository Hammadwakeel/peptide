"use client";

import { Layers, Route, Scale } from "lucide-react";
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
import { layoutSectionYClass, typeDisplayTitle, typeSectionLabel } from "@/lib/brand/design-system";
import { LANDING_PROBLEM } from "@/lib/landing/content";

const painIcons = [Layers, Route, Scale] as const;

const bodySentences = LANDING_PROBLEM.body
  .split(/(?<=\.)\s+/)
  .filter(Boolean);

export function TheProblem() {
  return (
    <section
      id="problem"
      className={`relative overflow-hidden bg-[#FEF5F2] ${layoutSectionYClass}`}
      aria-label="The Problem"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-pacific-teal/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-coral-blush/40 blur-3xl" />
      </div>

      <div className={`relative ${layoutContainerClass}`}>
        <motion.p
          className={typeSectionLabel}
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
            className={`${typeDisplayTitle} text-balance`}
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
              className={`${typeDisplayTitle} text-pacific-teal`}
              tone="light"
            >
              {LANDING_PROBLEM.titleLine2}
            </ScrollFocusHeading>
          </motion.div>
        </div>

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 xl:gap-16">
          <motion.div
            className="max-w-xl space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={staggerContainer}
          >
            {bodySentences.map((sentence) => (
              <motion.p
                key={sentence}
                className="type-body-l text-deep-teal/80 sm:text-lg"
                variants={fadeInUp}
                transition={transition}
              >
                {sentence}
              </motion.p>
            ))}
          </motion.div>

          <motion.ul
            className="grid gap-3 sm:gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={staggerContainer}
          >
            {LANDING_PROBLEM.painPoints.map((point, index) => {
              const Icon = painIcons[index] ?? Layers;

              return (
                <motion.li
                  key={point.title}
                  className="group rounded-[1.25rem] border border-deep-teal/8 bg-pure-white/70 p-4 shadow-[0_8px_30px_rgba(1,26,36,0.05)] backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-pacific-teal/20 hover:shadow-[0_14px_40px_rgba(1,26,36,0.08)] sm:p-5"
                  variants={fadeInUp}
                  transition={transition}
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-pacific-teal/15 bg-pacific-teal/8 text-pacific-teal transition-colors duration-300 group-hover:bg-pacific-teal/12">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-sans text-base font-medium tracking-[-0.01em] text-deep-teal sm:text-lg">
                        {point.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-deep-teal/70 sm:text-[0.9375rem]">
                        {point.description}
                      </p>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
