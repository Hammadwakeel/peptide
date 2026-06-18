"use client";

import Image from "next/image";
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
  glassCtaOnMediaClass,
  glassPanelClass,
} from "@/lib/brand/design-system";
import { LANDING_CTA, LANDING_HERO } from "@/lib/landing/content";
import { LANDING_HERO_CAPSULE_IMAGE, LANDING_HERO_VIDEO } from "@/lib/landing/preload-assets";
import { PortalCtaMark } from "@/components/landing/PortalCtaMark";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-dvh flex-col overflow-hidden font-sans text-pure-white"
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
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <Navbar heroGlass />

        <div className="mx-auto flex w-full max-w-[1440px] flex-1 items-center px-4 pb-10 pt-2 sm:px-6 sm:pb-14 sm:pt-4 lg:px-10">
          <motion.div
            className={`relative z-[1] w-full ${glassPanelClass} px-6 py-8 sm:px-9 sm:py-10 lg:px-12 lg:py-12`}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <div className="relative z-[1] grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10 xl:gap-14">
              <div className="flex flex-col justify-center">
                <motion.div variants={fadeInUp} transition={transition}>
                  <h1 className="type-display max-w-2xl text-balance text-pure-white">
                    {LANDING_HERO.headline}
                  </h1>
                </motion.div>

                <motion.p
                  className="mt-5 max-w-xl type-body-l text-pure-white/82 sm:mt-6 sm:text-lg"
                  variants={fadeInUp}
                  transition={transition}
                >
                  {LANDING_HERO.subhead}
                </motion.p>

                <motion.div
                  className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
                  variants={fadeInUp}
                  transition={transition}
                >
                  <Link href={LANDING_CTA.onboard.href} className={`w-fit ${glassCtaOnMediaClass}`}>
                    <span>{LANDING_CTA.onboard.label}</span>
                    <PortalCtaMark />
                  </Link>
                  <Link href={LANDING_CTA.browseCatalog.href} className={`w-fit ${glassCtaGhostOnMediaClass}`}>
                    {LANDING_CTA.browseCatalog.label}
                  </Link>
                </motion.div>
              </div>

              <motion.div
                className="flex items-center justify-center lg:justify-end"
                variants={fadeInUp}
                transition={transition}
              >
                <Image
                  src={LANDING_HERO_CAPSULE_IMAGE}
                  alt="Pharmaceutical capsule"
                  width={480}
                  height={640}
                  priority
                  className="h-auto w-full max-h-[200px] max-w-[220px] object-contain sm:max-h-[260px] sm:max-w-[280px] lg:max-h-[380px] lg:max-w-[340px] xl:max-h-[420px] xl:max-w-[380px]"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
