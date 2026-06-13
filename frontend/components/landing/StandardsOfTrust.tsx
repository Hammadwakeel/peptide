"use client";

import Image from "next/image";
import { LandingSectionHeader, layoutContainerClass } from "@/components/landing/LandingSectionHeader";
import {
  fadeInUp,
  motion,
  slideInLeft,
  staggerContainer,
  transition,
  viewport,
} from "@/components/motion";
import { layoutSectionYClass, shapeStandardsCards } from "@/lib/brand/design-system";

const metrics = [
  {
    value: "99.97%",
    label: "Purity Verification Rate",
    description:
      "Every molecular batch undergoes multi-stage verification before release.",
    cardClass: "bg-coral-blush text-deep-teal",
    dividerClass: "bg-deep-teal/20",
    bodyClass: "text-deep-teal/75",
    hoverClass: "sm:hover:shadow-md sm:hover:brightness-[0.98]",
    shapeClass: shapeStandardsCards[0],
  },
  {
    value: "24/7",
    label: "Batch Traceability",
    description:
      "Complete chain-of-custody visibility from synthesis to practitioner delivery.",
    cardClass: "bg-pacific-teal text-pure-white",
    dividerClass: "bg-pure-white/30",
    bodyClass: "text-pure-white/85",
    hoverClass: "sm:hover:shadow-md sm:hover:brightness-110",
    shapeClass: shapeStandardsCards[1],
  },
  {
    value: "3x",
    label: "Validation Layers",
    description:
      "Independent verification protocols eliminate single-point failure.",
    cardClass: "bg-deep-teal text-pure-white",
    dividerClass: "bg-pure-white/30",
    bodyClass: "text-pure-white/85",
    hoverClass: "sm:hover:shadow-md sm:hover:brightness-125",
    shapeClass: shapeStandardsCards[2],
  },
  {
    value: "100%",
    label: "Domestic Workflow",
    description:
      "Controlled verification and documentation within a single ecosystem.",
    cardClass: "bg-pure-white text-deep-teal",
    dividerClass: "bg-pacific-teal/30",
    bodyClass: "text-deep-teal/75",
    hoverClass: "sm:hover:shadow-md sm:hover:brightness-[0.98]",
    shapeClass: shapeStandardsCards[3],
  },
];

export function StandardsOfTrust() {
  return (
    <section id="standards" className={`bg-surface-muted ${layoutSectionYClass}`}>
      <div className={layoutContainerClass}>
        <LandingSectionHeader
          label="Standards of Trust"
          title={
            <>
              Proven by standard.
              <br />
              Backed by data.
            </>
          }
        />

        <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-2xl sm:rounded-[2.5rem]"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={slideInLeft}
            transition={transition}
          >
            <Image
              src="/brand/campaign-supply-layer-banner.png"
              alt="Supply chain layer visualization"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>

          <motion.div
            className="grid gap-4 sm:grid-cols-2 sm:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={staggerContainer}
          >
            {metrics.map((metric) => (
              <motion.div
                key={metric.label}
                className={`group p-6 transition-[box-shadow,filter] duration-300 sm:p-10 ${metric.shapeClass} ${metric.cardClass} ${metric.hoverClass}`}
                variants={fadeInUp}
                transition={transition}
              >
                <div className="font-sans text-3xl font-semibold leading-none sm:text-4xl">
                  {metric.value}
                </div>
                <div className={`mt-4 h-px w-12 sm:mt-6 sm:w-16 ${metric.dividerClass}`} />
                <h3 className="mt-4 font-sans text-xl font-semibold sm:mt-6 sm:text-2xl">
                  {metric.label}
                </h3>
                <p className={`mt-3 text-sm leading-relaxed sm:mt-4 sm:text-base ${metric.bodyClass}`}>
                  {metric.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
