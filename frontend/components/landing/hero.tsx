"use client";

import Link from "next/link";
import {
  fadeInUp,
  motion,
  staggerContainer,
  transition,
} from "@/components/motion";
import { Navbar } from "@/components/Navbar";
import {
  glassCtaGhostOnMediaClass,
  glassOnboardCtaClass,
  glassPanelClass,
  landingTopRailClass,
  landingTopShellClass,
} from "@/lib/brand/design-system";
import { LANDING_CTA, LANDING_HERO } from "@/lib/landing/content";
import { LANDING_HERO_VIDEO } from "@/lib/landing/preload-assets";
import { PortalCtaMark } from "@/components/landing/PortalCtaMark";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-dvh flex-col overflow-hidden bg-deep-teal font-sans text-pure-white"
      aria-label="Hero"
    >
      <video
        src={LANDING_HERO_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
      />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <Navbar heroGlass />

        <div className={`${landingTopShellClass} flex flex-1 items-center pb-10 pt-2 sm:pb-14 sm:pt-4`}>
          <div className={`${landingTopRailClass} w-full`}>
            <motion.div
              className={`relative z-[1] w-full ${glassPanelClass} px-8 py-10 sm:px-12 sm:py-12 lg:px-16 lg:py-14`}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <div className="relative z-[1] flex flex-col items-center text-center">
                <motion.div variants={fadeInUp} transition={transition}>
                  <h1 className="type-display mx-auto max-w-4xl text-balance text-pure-white">
                    {LANDING_HERO.headline}
                  </h1>
                </motion.div>

                <motion.p
                  className="mt-5 mx-auto max-w-2xl type-body-l text-pure-white/82 sm:mt-6 sm:text-lg"
                  variants={fadeInUp}
                  transition={transition}
                >
                  {LANDING_HERO.subhead}
                </motion.p>

                <motion.div
                  className="mt-7 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4"
                  variants={fadeInUp}
                  transition={transition}
                >
                  <Link href={LANDING_CTA.onboard.href} className={`w-fit ${glassOnboardCtaClass}`}>
                    <span>{LANDING_CTA.onboard.label}</span>
                    <PortalCtaMark />
                  </Link>
                  <Link href={LANDING_CTA.browseCatalog.href} className={`w-fit ${glassCtaGhostOnMediaClass}`}>
                    {LANDING_CTA.browseCatalog.label}
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
