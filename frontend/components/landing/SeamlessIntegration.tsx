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

const cards = [
  {
    icon: Database,
    title: "API-First Architecture",
    description:
      "Sync verification data directly with existing EHR, EMR, and clinical systems.",
    bg: "bg-[#E6F0EE]",
  },
  {
    icon: LayoutDashboard,
    title: "Unified Dashboard",
    description:
      "One interface for verification, traceability, and operational oversight.",
    bg: "bg-[#F3EFE9]",
  },
  {
    icon: Bell,
    title: "Proactive Alerts",
    description:
      "Receive instant notifications when batches reach critical verification milestones.",
    bg: "bg-[#E8EEF2]",
  },
  {
    icon: Workflow,
    title: "Workflow Continuity",
    description:
      "Deploy without disrupting practitioners, inventory systems, or existing processes.",
    bg: "bg-[#F2F4F7]",
  },
];

export function SeamlessIntegration() {
  return (
    <section className="bg-pure-white py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[1400px] px-0">
        <motion.div
          className="mb-20 px-4 lg:px-0"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeInUp}
          transition={transition}
        >
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-pacific-teal">
            Seamless Integration
          </span>
          <h2 className="mt-4 font-serif text-5xl font-light text-deep-teal md:text-7xl">
            Integration that respects
            <br />
            your workflow.
          </h2>
        </motion.div>

        <motion.div
          className="grid gap-6 px-4 md:grid-cols-2 lg:grid-cols-3 lg:px-0"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer}
        >
          <motion.div
            className={`rounded-[2rem] ${cards[0].bg} p-8`}
            variants={fadeInUp}
            transition={transition}
          >
            <div className="max-w-[90%]">
              <Database className="h-8 w-8 text-deep-teal" />
              <h3 className="mt-6 font-serif text-2xl text-deep-teal">
                {cards[0].title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-deep-teal/70">
                {cards[0].description}
              </p>
            </div>
          </motion.div>

          <motion.div
            className="relative row-span-2 hidden overflow-hidden rounded-[2rem] shadow-2xl lg:block"
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
            className={`rounded-[2rem] ${cards[1].bg} p-8`}
            variants={fadeInUp}
            transition={transition}
          >
            <div className="max-w-[90%]">
              <LayoutDashboard className="h-8 w-8 text-deep-teal" />
              <h3 className="mt-6 font-serif text-2xl text-deep-teal">
                {cards[1].title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-deep-teal/70">
                {cards[1].description}
              </p>
            </div>
          </motion.div>

          <motion.div
            className={`rounded-[2rem] ${cards[2].bg} p-8`}
            variants={fadeInUp}
            transition={transition}
          >
            <div className="max-w-[90%]">
              <Bell className="h-8 w-8 text-deep-teal" />
              <h3 className="mt-6 font-serif text-2xl text-deep-teal">
                {cards[2].title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-deep-teal/70">
                {cards[2].description}
              </p>
            </div>
          </motion.div>

          <motion.div
            className={`rounded-[2rem] ${cards[3].bg} p-8`}
            variants={fadeInUp}
            transition={transition}
          >
            <div className="max-w-[90%]">
              <Workflow className="h-8 w-8 text-deep-teal" />
              <h3 className="mt-6 font-serif text-2xl text-deep-teal">
                {cards[3].title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-deep-teal/70">
                {cards[3].description}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
