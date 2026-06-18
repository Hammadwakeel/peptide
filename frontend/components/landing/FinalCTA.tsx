"use client";

import Link from "next/link";
import { PortalCtaMark } from "@/components/landing/PortalCtaMark";
import { layoutContainerClass } from "@/components/landing/LandingSectionHeader";
import {
  fadeInUp,
  motion,
  staggerContainer,
  transition,
  viewport,
} from "@/components/motion";
import { glassCtaOnMediaClass, glassPanelClass, layoutSectionYClass } from "@/lib/brand/design-system";
import { LANDING_CTA, LANDING_FINAL_CTA } from "@/lib/landing/content";
import { LANDING_PARTNER_ACCESS_VIDEO } from "@/lib/landing/preload-assets";

export function FinalCTA() {
  return (
    <section
      id="final-cta"
      className={`relative overflow-hidden bg-deep-teal font-sans text-pure-white ${layoutSectionYClass}`}
      aria-labelledby="final-cta-heading"
    >
      <video
        src={LANDING_PARTNER_ACCESS_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      />

      <div className={`relative z-10 flex items-center ${layoutContainerClass}`}>
        <motion.div
          className={`relative z-[1] w-full ${glassPanelClass} px-6 py-8 sm:px-9 sm:py-10 lg:px-12 lg:py-12`}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer}
        >
          <div className="relative z-[1] flex flex-col items-center text-center">
            <motion.h2
              id="final-cta-heading"
              className="type-display max-w-4xl text-balance text-pure-white"
              variants={fadeInUp}
              transition={transition}
            >
              {LANDING_FINAL_CTA.headline}
            </motion.h2>

            <motion.div
              className="mt-7 flex justify-center sm:mt-8"
              variants={fadeInUp}
              transition={transition}
            >
              <Link href={LANDING_CTA.onboard.href} className={`w-fit ${glassCtaOnMediaClass}`}>
                <span>{LANDING_CTA.onboard.label}</span>
                <PortalCtaMark />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
