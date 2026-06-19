"use client";

import Image from "next/image";
import {
  fadeInUp,
  motion,
  slideInLeft,
  slideInRight,
  staggerContainer,
  transition,
  viewport,
} from "@/components/motion";
import {
  glassPanelOnLightClass,
  landingTopRailClass,
  landingTopShellClass,
} from "@/lib/brand/design-system";
import { LANDING_PROBLEM } from "@/lib/landing/content";

const bodyParagraphs = [
  "Right now you're juggling a separate login, invoice, and vendor for peptides, compounds, and labs.",
  "And the moment a patient leaves, the refill happens somewhere else, you keep the liability, they keep the revenue.",
] as const;

export function PartnerNetwork() {
  return (
    <section
      id="problem"
      className="relative overflow-hidden bg-pure-white py-10 sm:py-14 lg:py-16"
      aria-labelledby="problem-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-pacific-teal/10 blur-3xl" />
        <div className="absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-deep-teal/8 blur-3xl" />
      </div>

      <div className={`relative ${landingTopShellClass}`}>
        <div className={`${landingTopRailClass} mx-auto max-w-5xl`}>
          <motion.div
            className={`relative z-[1] grid w-full overflow-hidden !rounded-[1.5rem] sm:!rounded-[1.75rem] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] ${glassPanelOnLightClass}`}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={fadeInUp}
            transition={transition}
          >
            <motion.div
              className="relative min-h-[180px] sm:min-h-[200px] lg:min-h-[15rem]"
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={slideInLeft}
              transition={transition}
            >
              <Image
                src={LANDING_PROBLEM.image}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>

            <motion.div
              className="relative z-[1] flex flex-col justify-center px-5 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8"
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={slideInRight}
              transition={{ ...transition, delay: 0.06 }}
            >
              <p className="font-sans text-xs font-light uppercase tracking-[0.04em] text-pacific-teal">
                {LANDING_PROBLEM.label}
              </p>

              <div className="mt-3 max-w-md space-y-0.5 sm:mt-4">
                <h2
                  id="problem-heading"
                  className="type-h2 text-balance text-deep-teal"
                >
                  {LANDING_PROBLEM.titleLine1}
                </h2>
                <p className="type-h2 text-balance font-light text-pacific-teal">
                  {LANDING_PROBLEM.titleLine2}
                </p>
              </div>

              <motion.div
                className="mt-4 max-w-md space-y-3 sm:mt-5"
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
                variants={staggerContainer}
              >
                {bodyParagraphs.map((paragraph) => (
                  <motion.p
                    key={paragraph}
                    className="text-sm leading-relaxed text-deep-teal/75 sm:text-base"
                    variants={fadeInUp}
                    transition={transition}
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
