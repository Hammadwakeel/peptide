"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  fadeInUp,
  motion,
  scaleIn,
  staggerContainer,
  transition,
} from "@/components/motion";
import { HeroScrollSequence } from "@/components/landing/HeroScrollSequence";

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative bg-pure-white font-sans text-deep-teal"
      aria-label="Hero"
    >
      <div className="sticky top-16 flex min-h-[calc(100dvh-4rem)] items-center bg-pure-white pb-8 pt-4">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid w-full items-center gap-6 sm:gap-8 lg:grid-cols-12">
            <motion.div
              className="flex flex-col gap-4 sm:gap-6 lg:col-span-6"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div
                className="rounded-2xl bg-pacific-teal p-6 shadow-xl sm:rounded-[2rem] sm:p-10 lg:p-16"
                variants={fadeInUp}
                transition={transition}
              >
                <h1 className="font-serif text-3xl font-light leading-[1.1] tracking-[-0.02em] text-pure-white sm:text-4xl lg:text-5xl xl:text-[3.5rem]">
                  The molecule arrives verified.
                  <br />
                  Or it doesn&apos;t arrive.
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-relaxed text-pure-white/90 sm:mt-8 sm:text-lg">
                  For pharmacies and practitioners who need unconditional trust,
                  Frontier Biomed verifies purity at every bond, domestic by
                  design.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} transition={transition}>
                <Link
                  href="/login"
                  className="group flex w-full items-center justify-between rounded-2xl bg-deep-teal px-6 py-5 shadow-lg transition-transform active:scale-[0.99] sm:rounded-[2rem] sm:px-10 sm:py-8 sm:hover:scale-[1.01] sm:hover:bg-deep-teal/95"
                >
                  <span className="text-lg font-medium text-pure-white sm:text-xl lg:text-2xl">
                    Partner Portal
                  </span>

                  <ArrowRightIcon className="h-6 w-6 text-pure-white transition-transform group-hover:translate-x-2 sm:h-8 sm:w-8" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex w-full justify-center lg:col-span-6 lg:justify-end"
              initial="hidden"
              animate="visible"
              variants={scaleIn}
              transition={{ ...transition, delay: 0.2 }}
            >
              <div className="relative aspect-[2/3] w-full max-w-[420px] lg:aspect-auto lg:h-[min(680px,72vh)] lg:min-h-[320px] lg:max-w-none">
                <HeroScrollSequence
                  sectionRef={sectionRef}
                  className="h-full w-full"
                  style={{
                    WebkitMaskImage:
                      "linear-gradient(to right, transparent 0%, #000 18%, #000 82%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)",
                    maskImage:
                      "linear-gradient(to right, transparent 0%, #000 18%, #000 82%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)",
                    WebkitMaskComposite: "source-in",
                    maskComposite: "intersect",
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
