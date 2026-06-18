"use client";

import { layoutContainerClass } from "@/components/landing/LandingSectionHeader";
import {
  fadeInUp,
  motion,
  staggerContainer,
  transition,
  viewport,
} from "@/components/motion";
import { layoutSectionYClass, typeSectionLabel } from "@/lib/brand/design-system";
import { LANDING_HOW_IT_WORKS } from "@/lib/landing/content";
import { HOW_IT_WORKS_STEPS } from "@/lib/landing/how-it-works-steps";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className={`relative overflow-hidden bg-[#FEF5F2] ${layoutSectionYClass}`}
      aria-labelledby="how-it-works-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-pacific-teal/8 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-coral-blush/30 blur-3xl" />
      </div>

      <div className={`relative ${layoutContainerClass}`}>
        <motion.p
          id="how-it-works-heading"
          className={typeSectionLabel}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeInUp}
          transition={transition}
        >
          {LANDING_HOW_IT_WORKS.label}
        </motion.p>

        <motion.ol
          className="relative mt-10 grid gap-5 sm:mt-12 lg:mt-14 lg:grid-cols-3 lg:gap-6 xl:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer}
        >
          <div
            className="pointer-events-none absolute left-[calc(16.67%-0.5rem)] right-[calc(16.67%-0.5rem)] top-10 hidden h-px bg-deep-teal/12 lg:block"
            aria-hidden
          />

          {HOW_IT_WORKS_STEPS.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.li
                key={step.title}
                className="relative"
                variants={fadeInUp}
                transition={{ ...transition, delay: index * 0.06 }}
              >
                <article
                  className={`group flex h-full flex-col border border-deep-teal/8 bg-pure-white/80 p-6 shadow-[0_10px_40px_rgba(1,26,36,0.05)] backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-deep-teal/14 hover:shadow-[0_16px_48px_rgba(1,26,36,0.08)] sm:p-7 ${step.shapeClass}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-2xl ${step.iconWrapClass}`}
                      aria-hidden
                    >
                      <Icon className="size-5" />
                    </span>
                    <span
                      className={`inline-flex size-9 items-center justify-center font-sans text-xs font-medium tabular-nums ${step.accentClass}`}
                      aria-hidden
                    >
                      {step.step}
                    </span>
                  </div>

                  <h3 className="mt-6 font-sans text-xl font-medium tracking-[-0.01em] text-deep-teal sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-deep-teal/70 sm:mt-4 sm:text-base">
                    {step.description}
                  </p>
                </article>
              </motion.li>
            );
          })}
        </motion.ol>
      </div>
    </section>
  );
}
