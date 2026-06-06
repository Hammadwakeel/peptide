"use client";

import Link from "next/link";
import {
  fadeInUp,
  motion,
  staggerContainer,
  transition,
  viewport,
} from "@/components/motion";

function ArrowRightIcon() {
  return (
    <svg
      className="h-5 w-5 sm:h-6 sm:w-6"
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

export function FinalCTA() {
  return (
    <section className="bg-pure-white py-16 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 md:px-12 lg:px-20">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer}
        >
          <motion.span
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-pacific-teal sm:text-xs sm:tracking-[0.35em]"
            variants={fadeInUp}
            transition={transition}
          >
            Partner Access
          </motion.span>

          <motion.h2
            className="mx-auto mt-4 max-w-5xl font-serif text-3xl font-light leading-[1.05] tracking-[-0.04em] text-deep-teal sm:mt-6 sm:text-5xl md:text-6xl lg:text-8xl"
            variants={fadeInUp}
            transition={transition}
          >
            Ready to verify
            <br />
            the future?
          </motion.h2>

          <motion.p
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-deep-teal/70 sm:mt-8 sm:text-lg lg:text-xl"
            variants={fadeInUp}
            transition={transition}
          >
            Join the network of practitioners, pharmacies, and clinical teams
            who refuse to compromise on molecular certainty.
          </motion.p>

          <motion.div
            className="mt-8 flex justify-center sm:mt-12"
            variants={fadeInUp}
            transition={transition}
          >
            <Link
              href="/login"
              className="group inline-flex w-full max-w-sm items-center justify-center gap-3 rounded-full bg-deep-teal px-6 py-4 text-sm font-medium text-pure-white transition-all duration-300 active:scale-[0.98] sm:w-auto sm:gap-4 sm:px-8 sm:py-5 sm:text-base sm:hover:scale-[1.03]"
            >
              Partner Portal
              <ArrowRightIcon />
              <span className="sr-only">Open Partner Portal</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
