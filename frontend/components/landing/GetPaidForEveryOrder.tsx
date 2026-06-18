"use client";

import Image from "next/image";
import { layoutContainerClass } from "@/components/landing/LandingSectionHeader";
import { ScrollFocusHeading } from "@/components/landing/ScrollFocusText";
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
  layoutSectionYClass,
  shapePortraitShowcase,
  typeDisplayTitle,
  typeSectionLabel,
} from "@/lib/brand/design-system";
import { GET_PAID_DASHBOARD_IMAGE, GET_PAID_HIGHLIGHTS } from "@/lib/landing/get-paid-highlights";
import { LANDING_GET_PAID } from "@/lib/landing/content";

export function GetPaidForEveryOrder() {
  return (
    <section
      id="get-paid"
      className={`relative overflow-hidden bg-pure-white ${layoutSectionYClass}`}
      aria-labelledby="get-paid-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-pacific-teal/8 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-deep-teal/5 blur-3xl" />
      </div>

      <div className={`relative ${layoutContainerClass}`}>
        <motion.p
          className={typeSectionLabel}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeInUp}
          transition={transition}
        >
          {LANDING_GET_PAID.label}
        </motion.p>

        <div className="mt-4 grid gap-10 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-12 xl:gap-16">
          <div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={slideInLeft}
              transition={transition}
            >
              <ScrollFocusHeading
                as="h2"
                className={`${typeDisplayTitle} text-balance`}
                tone="light"
              >
                <span id="get-paid-heading">{LANDING_GET_PAID.title}</span>
              </ScrollFocusHeading>
            </motion.div>

            <motion.p
              className="mt-6 max-w-xl text-base leading-7 text-deep-teal/75 sm:mt-8 sm:text-lg"
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={fadeInUp}
              transition={{ ...transition, delay: 0.08 }}
            >
              {LANDING_GET_PAID.body}
            </motion.p>

            <motion.ul
              className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={staggerContainer}
            >
              {GET_PAID_HIGHLIGHTS.map((highlight) => {
                const Icon = highlight.icon;

                return (
                  <motion.li key={highlight.title} variants={fadeInUp} transition={transition}>
                    <article
                      className={`flex h-full flex-col p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-6 ${highlight.shapeClass} ${highlight.cardClass}`}
                    >
                      <Icon className={`size-5 ${highlight.iconClass}`} aria-hidden />
                      <h3 className="mt-4 font-sans text-base font-medium tracking-[-0.01em] sm:text-lg">
                        {highlight.title}
                      </h3>
                      <p className={`mt-2 text-sm leading-relaxed ${highlight.bodyClass}`}>
                        {highlight.description}
                      </p>
                    </article>
                  </motion.li>
                );
              })}
            </motion.ul>
          </div>

          <motion.div
            className="relative mx-auto w-full max-w-md lg:max-w-none"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={slideInRight}
            transition={transition}
          >
            <div
              className={`relative aspect-[4/5] w-full overflow-hidden bg-[#FEF5F2] ring-1 ring-deep-teal/[0.06] ${shapePortraitShowcase}`}
            >
              <div className="relative flex h-full w-full items-center justify-center p-6 sm:p-8">
                <div className="relative h-full w-full">
                  <Image
                    src={GET_PAID_DASHBOARD_IMAGE}
                    alt="FrontierBioMed provider dashboard showing order payouts"
                    fill
                    className="object-contain object-center drop-shadow-[0_24px_50px_rgba(1,26,36,0.14)]"
                    sizes="(max-width: 1024px) 90vw, 40vw"
                  />
                </div>
              </div>
            </div>

            <div
              className="absolute -bottom-4 left-6 right-6 rounded-2xl border border-deep-teal/8 bg-pure-white/90 px-4 py-3 shadow-[0_16px_40px_rgba(1,26,36,0.08)] backdrop-blur-sm sm:left-8 sm:right-8 sm:px-5 sm:py-4"
              aria-hidden
            >
              <p className="font-sans text-[10px] font-light uppercase tracking-[0.04em] text-deep-teal/50">
                In-platform settlement
              </p>
              <p className="mt-1 font-sans text-sm font-medium text-deep-teal">
                No third-party processor · No surprise markups
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
