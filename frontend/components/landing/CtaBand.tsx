"use client";

import Link from "next/link";
import { layoutContainerClass } from "@/components/landing/LandingSectionHeader";
import { PortalCtaMark } from "@/components/landing/PortalCtaMark";
import { ScrollFocusHeading } from "@/components/landing/ScrollFocusText";
import {
  fadeInUp,
  motion,
  slideInLeft,
  slideInRight,
  transition,
  viewport,
} from "@/components/motion";
import { layoutSectionYClass, shapeCtaBanner } from "@/lib/brand/design-system";
import { LANDING_CTA, LANDING_CTA_BAND } from "@/lib/landing/content";

export function CtaBand() {
  return (
    <section
      id="cta-band"
      className={`relative overflow-hidden bg-deep-teal ${layoutSectionYClass}`}
      aria-labelledby="cta-band-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-pacific-teal/25 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-pure-white/8 blur-3xl" />
      </div>

      <div className={`relative z-10 ${layoutContainerClass}`}>
        <motion.div
          className={`flex flex-col gap-8 px-6 py-12 sm:gap-10 sm:px-10 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-14 lg:py-16 ${shapeCtaBanner} border border-pure-white/10 bg-pure-white/[0.04] backdrop-blur-sm`}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeInUp}
          transition={transition}
        >
          <div className="max-w-2xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={slideInLeft}
              transition={transition}
            >
              <ScrollFocusHeading
                as="h2"
                className="type-display text-balance text-pure-white"
                tone="dark"
              >
                <span id="cta-band-heading">{LANDING_CTA_BAND.headline}</span>
              </ScrollFocusHeading>
            </motion.div>

            <motion.p
              className="mt-4 max-w-xl type-body-l text-pure-white/80 sm:mt-5 sm:text-lg"
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={slideInLeft}
              transition={{ ...transition, delay: 0.08 }}
            >
              {LANDING_CTA_BAND.subhead}
            </motion.p>
          </div>

          <motion.div
            className="shrink-0 lg:pl-4"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={slideInRight}
            transition={{ ...transition, delay: 0.1 }}
          >
            <Link
              href={LANDING_CTA.onboard.href}
              className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-pure-white px-8 py-4 text-sm font-light text-deep-teal transition-[background-color,transform,box-shadow] duration-300 hover:bg-coral-blush hover:shadow-[0_16px_40px_rgba(1,26,36,0.2)] sm:w-auto sm:text-base"
            >
              <span>{LANDING_CTA.onboard.label}</span>
              <PortalCtaMark className="size-5 text-deep-teal sm:size-[1.35rem]" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
