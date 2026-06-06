"use client";

import Image from "next/image";
import {
  fadeInUp,
  motion,
  slideInLeft,
  staggerContainer,
  transition,
  viewport,
} from "@/components/motion";

const metrics = [
  {
    value: "99.97%",
    label: "Purity Verification Rate",
    description:
      "Every molecular batch undergoes multi-stage verification before release.",
    bg: "bg-[#E6F0EE]",
  },
  {
    value: "24/7",
    label: "Batch Traceability",
    description:
      "Complete chain-of-custody visibility from synthesis to practitioner delivery.",
    bg: "bg-[#F3EFE9]",
  },
  {
    value: "3x",
    label: "Validation Layers",
    description:
      "Independent verification protocols eliminate single-point failure.",
    bg: "bg-[#E8EEF2]",
  },
  {
    value: "100%",
    label: "Domestic Workflow",
    description:
      "Controlled verification and documentation within a single ecosystem.",
    bg: "bg-[#F2F4F7]",
  },
];

export function StandardsOfTrust() {
  return (
    <section id="standards" className="bg-slate-50 py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 md:px-12 lg:px-20 xl:px-28">
        <motion.div
          className="mb-10 text-center sm:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeInUp}
          transition={transition}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-pacific-teal sm:text-xs sm:tracking-[0.3em]">
            Standards of Trust
          </span>
          <h2 className="mt-3 font-serif text-3xl font-light leading-[1.08] tracking-[-0.03em] text-deep-teal sm:text-5xl md:text-6xl lg:text-7xl">
            Proven by standard.
            <br />
            Backed by data.
          </h2>
        </motion.div>

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
                className={`group rounded-2xl border border-deep-teal/5 ${metric.bg} p-6 transition-all duration-500 sm:rounded-[2.5rem] sm:p-10 sm:hover:-translate-y-2 sm:hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]`}
                variants={fadeInUp}
                transition={transition}
              >
                <div className="font-serif text-4xl font-light leading-none tracking-[-0.04em] text-deep-teal sm:text-5xl">
                  {metric.value}
                </div>
                <div className="mt-4 h-px w-12 bg-deep-teal/20 sm:mt-6 sm:w-16" />
                <h3 className="mt-4 font-serif text-xl font-light text-deep-teal sm:mt-6 sm:text-2xl">
                  {metric.label}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-deep-teal/75 sm:mt-4 sm:text-base">
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
