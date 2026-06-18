"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { layoutContainerClass } from "@/components/landing/LandingSectionHeader";
import {
  fadeInUp,
  motion,
  staggerContainer,
  transition,
  viewport,
} from "@/components/motion";
import { layoutSectionYClass, typeSectionLabel } from "@/lib/brand/design-system";
import { CATALOG_CATEGORIES, CATALOG_STATS } from "@/lib/landing/catalog-items";
import { LANDING_CATALOG } from "@/lib/landing/content";

const CATALOG_VIAL_IMAGE = "/brand/product-vial-2x-blend-hero.png";

const categoryPositions: Array<{
  top: string;
  left?: string;
  right?: string;
  className: string;
}> = [
  { top: "6%", left: "2%", className: "lg:left-[4%]" },
  { top: "10%", right: "0%", className: "lg:right-[6%]" },
  { top: "36%", left: "-2%", className: "lg:left-0" },
  { top: "40%", right: "-2%", className: "lg:right-[2%]" },
  { top: "66%", left: "4%", className: "lg:left-[8%]" },
  { top: "70%", right: "2%", className: "lg:right-[10%]" },
];

function FloatingCategory({
  category,
  index,
  className = "",
  style,
}: {
  category: string;
  index: number;
  className?: string;
  style?: CSSProperties;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      variants={fadeInUp}
      transition={transition}
      className={`list-none ${className}`}
      style={style}
    >
      <motion.span
        className="inline-flex items-center whitespace-nowrap rounded-full border border-pure-white/70 bg-pure-white/90 px-4 py-2 font-sans text-sm font-medium text-deep-teal shadow-[0_14px_40px_rgba(1,26,36,0.1)] backdrop-blur-md transition-[border-color,box-shadow] duration-300 hover:border-pacific-teal/25 hover:shadow-[0_20px_50px_rgba(1,26,36,0.14)] sm:px-5 sm:py-2.5 sm:text-base"
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -10, 0],
              }
        }
        transition={
          reduceMotion
            ? undefined
            : {
                duration: 3.4 + index * 0.35,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.22,
              }
        }
      >
        {category}
      </motion.span>
    </motion.li>
  );
}

export function TheCatalog() {
  return (
    <section
      id="catalog"
      className={`relative overflow-hidden bg-[#FEF5F2] ${layoutSectionYClass}`}
      aria-labelledby="catalog-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-pacific-teal/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-coral-blush/35 blur-3xl" />
      </div>

      <div className={`relative ${layoutContainerClass}`}>
        <motion.p
          id="catalog-heading"
          className={typeSectionLabel}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeInUp}
          transition={transition}
        >
          {LANDING_CATALOG.label}
        </motion.p>

        <div className="mt-10 lg:mt-14">
          <p className="font-sans text-xs font-light uppercase tracking-[0.04em] text-deep-teal/55">
            {LANDING_CATALOG.categoriesHeading}
          </p>

          <div className="relative mx-auto mt-6 min-h-[28rem] w-full max-w-5xl sm:min-h-[32rem] lg:mt-8 lg:min-h-[36rem]">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[min(72vw,22rem)] w-[min(72vw,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pacific-teal/8 blur-3xl lg:h-[26rem] lg:w-[26rem]"
              aria-hidden
            />

            <motion.div
              className="relative z-10 mx-auto aspect-[3/4] w-[min(58vw,17.5rem)] sm:w-[min(42vw,18rem)] lg:w-[22rem]"
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={fadeInUp}
              transition={transition}
            >
              <Image
                src={CATALOG_VIAL_IMAGE}
                alt="FrontierBioMed product vial"
                fill
                className="object-contain object-center drop-shadow-[0_28px_60px_rgba(1,26,36,0.14)]"
                sizes="(max-width: 1024px) 58vw, 22rem"
                priority={false}
              />
            </motion.div>

            <motion.ul
              className="absolute inset-0 z-20 hidden lg:block"
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={staggerContainer}
              aria-label={LANDING_CATALOG.categoriesHeading}
            >
              {CATALOG_CATEGORIES.map((category, index) => {
                const position = categoryPositions[index];

                return (
                  <FloatingCategory
                    key={category}
                    category={category}
                    index={index}
                    className={`absolute ${position.className}`}
                    style={{
                      top: position.top,
                      left: position.left,
                      right: position.right,
                    }}
                  />
                );
              })}
            </motion.ul>
          </div>

          <motion.ul
            className="relative z-20 mt-6 flex flex-wrap justify-center gap-3 sm:mt-8 sm:gap-4 lg:hidden"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={staggerContainer}
            aria-label={LANDING_CATALOG.categoriesHeading}
          >
            {CATALOG_CATEGORIES.map((category, index) => (
              <FloatingCategory key={category} category={category} index={index} />
            ))}
          </motion.ul>
        </div>

        <motion.div
          className="mt-12 sm:mt-14 lg:mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeInUp}
          transition={{ ...transition, delay: 0.06 }}
        >
          <p className="font-sans text-xs font-light uppercase tracking-[0.04em] text-deep-teal/55">
            {LANDING_CATALOG.statsHeading}
          </p>
          <motion.ul
            className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-3 sm:gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={staggerContainer}
          >
            {CATALOG_STATS.map((stat) => (
              <motion.li key={stat.label} variants={fadeInUp} transition={transition}>
                <article
                  className={`flex h-full flex-col p-5 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-6 ${stat.shapeClass} ${stat.cardClass}`}
                >
                  <p className="font-sans text-2xl font-light leading-none sm:text-3xl">
                    {stat.value}
                  </p>
                  <div className={`mt-4 h-px w-10 ${stat.dividerClass}`} aria-hidden />
                  <p className={`mt-4 font-sans text-sm font-medium capitalize sm:text-base ${stat.bodyClass}`}>
                    {stat.label}
                  </p>
                </article>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
