"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { layoutContainerClass } from "@/components/landing/LandingSectionHeader";
import { fadeInUp, motion, transition, viewport } from "@/components/motion";
import { layoutSectionYClass, shapeCtaBanner, typeSectionLabel } from "@/lib/brand/design-system";

export function FinalCTA() {
  return (
    <section className={`bg-pure-white ${layoutSectionYClass}`}>
      <div className={layoutContainerClass}>
        <motion.div
          className={`overflow-hidden bg-deep-teal px-6 py-14 text-center ring-1 ring-pure-white/10 sm:px-10 sm:py-16 lg:px-16 lg:py-20 ${shapeCtaBanner}`}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeInUp}
          transition={transition}
        >
          <p className={`${typeSectionLabel} text-pure-white/55`}>Partner Access</p>

          <h2 className="mx-auto mt-4 max-w-3xl font-editorial text-3xl font-light leading-tight text-pure-white sm:mt-5 sm:text-4xl lg:text-[2.75rem]">
            Ready to verify
            <br />
            the future?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-pure-white/65 sm:mt-6 sm:text-lg">
            Join the network of practitioners, pharmacies, and clinical teams who refuse to compromise
            on molecular certainty.
          </p>

          <div className="mt-8 flex justify-center sm:mt-10">
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-coral-blush px-7 py-3.5 text-sm font-light text-deep-teal transition-[background-color,transform] duration-300 ease-out hover:bg-coral-blush/90 hover:scale-[1.02] sm:gap-3 sm:px-8 sm:py-4 sm:text-base"
            >
              Partner Portal
              <ArrowRight
                className="size-5 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
              <span className="sr-only">Open Partner Portal</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
