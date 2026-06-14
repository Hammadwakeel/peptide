"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { Database, LayoutDashboard, Bell, Workflow } from "lucide-react";
import { LandingSectionHeader, layoutContainerClass } from "@/components/landing/LandingSectionHeader";
import {
  fadeInUp,
  motion,
  scaleIn,
  staggerContainer,
  transition,
  viewport,
} from "@/components/motion";
import {
  layoutSectionYClass,
  shapeIntegrationCards,
  shapePortraitShowcase,
  shapeStadiumCapsule,
} from "@/lib/brand/design-system";
import { useReducedMotion } from "framer-motion";

const PRODUCT_DASHBOARD_SRC = "/brand/product-mobile-dashboard.png";

const cards = [
  {
    icon: Database,
    title: "API-First Architecture",
    description:
      "Sync verification data directly with existing EHR, EMR, and clinical systems.",
    cardClass: "bg-coral-blush text-deep-teal",
    iconClass: "text-pacific-teal",
    bodyClass: "text-deep-teal/75",
    hoverClass: "sm:hover:shadow-md sm:hover:brightness-[0.98]",
    shapeClass: shapeIntegrationCards[0],
  },
  {
    icon: LayoutDashboard,
    title: "Unified Dashboard",
    description:
      "One interface for verification, traceability, and operational oversight.",
    cardClass: "bg-pacific-teal text-pure-white",
    iconClass: "text-pure-white",
    bodyClass: "text-pure-white/85",
    hoverClass: "sm:hover:shadow-md sm:hover:brightness-110",
    shapeClass: shapeIntegrationCards[1],
  },
  {
    icon: Bell,
    title: "Proactive Alerts",
    description:
      "Receive instant notifications when batches reach critical verification milestones.",
    cardClass: "bg-deep-teal text-pure-white",
    iconClass: "text-pure-white",
    bodyClass: "text-pure-white/85",
    hoverClass: "sm:hover:shadow-md sm:hover:brightness-125",
    shapeClass: shapeIntegrationCards[2],
  },
  {
    icon: Workflow,
    title: "Workflow Continuity",
    description:
      "Deploy without disrupting practitioners, inventory systems, or existing processes.",
    cardClass: "bg-pure-white text-deep-teal",
    iconClass: "text-pacific-teal",
    bodyClass: "text-deep-teal/75",
    hoverClass: "sm:hover:shadow-md sm:hover:brightness-[0.98]",
    shapeClass: shapeIntegrationCards[3],
  },
];

const PRODUCT_DASHBOARD_SIDE_MASK: CSSProperties = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0%, #000 4%, #000 96%, transparent 100%)",
  maskImage:
    "linear-gradient(to right, transparent 0%, #000 4%, #000 96%, transparent 100%)",
};

const EDGE_FADE_CLASS =
  "pointer-events-none absolute rounded-[inherit] from-pure-white to-transparent";

function ProductDashboardImage({
  className = "",
  sizes,
  shape = "portrait",
}: {
  className?: string;
  sizes: string;
  shape?: "portrait" | "capsule";
}) {
  const reduceMotion = useReducedMotion();
  const shapeClass = shape === "capsule" ? shapeStadiumCapsule : shapePortraitShowcase;

  return (
    <motion.div
      className={`group relative min-h-[280px] cursor-pointer overflow-hidden bg-pure-white ring-1 ring-deep-teal/[0.06] ${shapeClass} ${className}`}
      variants={scaleIn}
      transition={transition}
      whileHover={
        reduceMotion
          ? undefined
          : {
              scale: 1.05,
              y: -14,
            }
      }
    >
      {/* Crop the hand at the bottom while keeping the full phone visible at the top. */}
      <div
        className="relative h-full w-full overflow-hidden"
        style={PRODUCT_DASHBOARD_SIDE_MASK}
      >
        <div className="absolute inset-x-0 top-0 h-[78%] overflow-hidden sm:h-[76%]">
          <Image
            src={PRODUCT_DASHBOARD_SRC}
            alt="Frontier mobile dashboard on iPhone"
            fill
            sizes={sizes}
            priority
            className="origin-top object-contain object-top scale-[1.16] drop-shadow-[0_24px_48px_rgba(1,26,36,0.18)] transition-[transform,filter] duration-500 ease-out group-hover:scale-[1.2] group-hover:drop-shadow-[0_36px_64px_rgba(1,26,36,0.28)]"
          />
        </div>
      </div>

      <div
        aria-hidden="true"
        className={`${EDGE_FADE_CLASS} inset-x-0 bottom-0 h-16 bg-gradient-to-t sm:h-20`}
      />
      <div
        aria-hidden="true"
        className={`${EDGE_FADE_CLASS} inset-y-0 left-0 w-6 bg-gradient-to-r sm:w-10`}
      />
      <div
        aria-hidden="true"
        className={`${EDGE_FADE_CLASS} inset-y-0 right-0 w-6 bg-gradient-to-l sm:w-10`}
      />
    </motion.div>
  );
}

function IntegrationCard({
  card,
  className = "",
}: {
  card: (typeof cards)[number];
  className?: string;
}) {
  const Icon = card.icon;

  return (
    <motion.div
      className={`p-6 transition-[box-shadow,filter] duration-300 sm:p-8 ${card.shapeClass} ${card.cardClass} ${card.hoverClass} ${className}`}
      variants={fadeInUp}
      transition={transition}
    >
      <Icon className={`h-7 w-7 sm:h-8 sm:w-8 ${card.iconClass}`} />
      <h3 className="mt-4 font-sans text-xl font-medium tracking-[-0.01em] sm:mt-6 sm:text-2xl">{card.title}</h3>
      <p className={`mt-2 text-sm leading-7 sm:mt-3 ${card.bodyClass}`}>{card.description}</p>
    </motion.div>
  );
}

export function SeamlessIntegration() {
  return (
    <section id="integrations" className={`bg-pure-white ${layoutSectionYClass}`}>
      <div className={layoutContainerClass}>
        <LandingSectionHeader
          align="left"
          label="Seamless Integration"
          title={
            <>
              Integration that respects
              <br />
              your workflow.
            </>
          }
        />

        <motion.div
          className="mb-4 aspect-[4/5] w-full sm:mb-6 sm:aspect-[16/10] lg:hidden"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={scaleIn}
          transition={transition}
        >
          <ProductDashboardImage className="h-full w-full" sizes="100vw" shape="capsule" />
        </motion.div>

        <motion.div
          className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer}
        >
          <IntegrationCard card={cards[0]} />

          <ProductDashboardImage
            className="row-span-2 hidden h-full min-h-[520px] lg:block"
            sizes="(max-width: 1024px) 0px, 33vw"
            shape="portrait"
          />

          <IntegrationCard card={cards[1]} />
          <IntegrationCard card={cards[2]} />
          <IntegrationCard card={cards[3]} className="md:col-span-2 lg:col-span-1" />
        </motion.div>
      </div>
    </section>
  );
}
