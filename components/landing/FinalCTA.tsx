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
      className="h-6 w-6"
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
    <section className="bg-pure-white py-32 lg:py-40">
      <div className="mx-auto max-w-[1400px] px-8 md:px-12 lg:px-20">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer}
        >
          <motion.span
            className="font-mono text-xs uppercase tracking-[0.35em] text-pacific-teal"
            variants={fadeInUp}
            transition={transition}
          >
            Partner Access
          </motion.span>

          <motion.h2
            className="mx-auto mt-6 max-w-5xl font-serif text-5xl font-light leading-[1.02] tracking-[-0.04em] text-deep-teal md:text-6xl lg:text-8xl"
            variants={fadeInUp}
            transition={transition}
          >
            Ready to verify
            <br />
            the future?
          </motion.h2>

          <motion.p
            className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-deep-teal/70 lg:text-xl"
            variants={fadeInUp}
            transition={transition}
          >
            Join the network of practitioners, pharmacies, and clinical teams
            who refuse to compromise on molecular certainty.
          </motion.p>

          <motion.div
            className="mt-12 flex justify-center"
            variants={fadeInUp}
            transition={transition}
          >
            <Link
              href="/login"
              className="group inline-flex items-center gap-4 rounded-full bg-deep-teal px-8 py-5 text-base font-medium text-pure-white transition-all duration-300 hover:scale-[1.03]"
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
