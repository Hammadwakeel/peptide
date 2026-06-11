"use client";

import Image from "next/image";
import { Database, LayoutDashboard, Bell, Workflow } from "lucide-react";
import {
  fadeInUp,
  motion,
  scaleIn,
  staggerContainer,
  transition,
  viewport,
} from "@/components/motion";
import { BRAND_SURFACE_CLASSES } from "@/lib/brand/colors";

const cards = [
  {
    icon: Database,
    title: "API-First Architecture",
    description:
      "Sync verification data directly with existing EHR, EMR, and clinical systems.",
    bg: BRAND_SURFACE_CLASSES[0],
  },
  {
    icon: LayoutDashboard,
    title: "Unified Dashboard",
    description:
      "One interface for verification, traceability, and operational oversight.",
    bg: BRAND_SURFACE_CLASSES[1],
  },
  {
    icon: Bell,
    title: "Proactive Alerts",
    description:
      "Receive instant notifications when batches reach critical verification milestones.",
    bg: BRAND_SURFACE_CLASSES[2],
  },
  {
    icon: Workflow,
    title: "Workflow Continuity",
    description:
      "Deploy without disrupting practitioners, inventory systems, or existing processes.",
    bg: BRAND_SURFACE_CLASSES[3],
  },
];

export function SeamlessIntegration() {
  return (
    <section className="bg-pure-white py-14 sm:py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-0">
        <motion.div
          className="mb-10 sm:mb-20 lg:px-0"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeInUp}
          transition={transition}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-pacific-teal sm:text-xs sm:tracking-[0.3em]">
            Seamless Integration
          </span>
          <h2 className="mt-3 font-serif text-3xl font-light leading-[1.08] text-deep-teal sm:mt-4 sm:text-5xl md:text-7xl">
            Integration that respects
            <br />
            your workflow.
          </h2>
        </motion.div>

        <motion.div
          className="relative mb-4 aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-2xl sm:mb-6 sm:aspect-[16/10] lg:hidden"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={scaleIn}
          transition={transition}
        >
          <Image
            src="/brand/product-mobile-dashboard.png"
            alt="Dashboard"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>

        <motion.div
          className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer}
        >
          <motion.div
            className={`rounded-2xl ${cards[0].bg} p-6 sm:rounded-[2rem] sm:p-8`}
            variants={fadeInUp}
            transition={transition}
          >
            <Database className="h-7 w-7 text-deep-teal sm:h-8 sm:w-8" />
            <h3 className="mt-4 font-serif text-xl text-deep-teal sm:mt-6 sm:text-2xl">
              {cards[0].title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-deep-teal/70 sm:mt-3">
              {cards[0].description}
            </p>
          </motion.div>

          <motion.div
            className="relative row-span-2 hidden min-h-[520px] overflow-hidden rounded-[2rem] shadow-2xl lg:block"
            variants={scaleIn}
            transition={transition}
          >
            <Image
              src="/brand/product-mobile-dashboard.png"
              alt="Dashboard"
              fill
              sizes="(max-width: 1024px) 0px, 33vw"
              className="object-cover"
            />
          </motion.div>

          <motion.div
            className={`rounded-2xl ${cards[1].bg} p-6 sm:rounded-[2rem] sm:p-8`}
            variants={fadeInUp}
            transition={transition}
          >
            <LayoutDashboard className="h-7 w-7 text-deep-teal sm:h-8 sm:w-8" />
            <h3 className="mt-4 font-serif text-xl text-deep-teal sm:mt-6 sm:text-2xl">
              {cards[1].title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-deep-teal/70 sm:mt-3">
              {cards[1].description}
            </p>
          </motion.div>

          <motion.div
            className={`rounded-2xl ${cards[2].bg} p-6 sm:rounded-[2rem] sm:p-8`}
            variants={fadeInUp}
            transition={transition}
          >
            <Bell className="h-7 w-7 text-deep-teal sm:h-8 sm:w-8" />
            <h3 className="mt-4 font-serif text-xl text-deep-teal sm:mt-6 sm:text-2xl">
              {cards[2].title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-deep-teal/70 sm:mt-3">
              {cards[2].description}
            </p>
          </motion.div>

          <motion.div
            className={`rounded-2xl ${cards[3].bg} p-6 sm:rounded-[2rem] sm:p-8 md:col-span-2 lg:col-span-1`}
            variants={fadeInUp}
            transition={transition}
          >
            <Workflow className="h-7 w-7 text-deep-teal sm:h-8 sm:w-8" />
            <h3 className="mt-4 font-serif text-xl text-deep-teal sm:mt-6 sm:text-2xl">
              {cards[3].title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-deep-teal/70 sm:mt-3">
              {cards[3].description}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
