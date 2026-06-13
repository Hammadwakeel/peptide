"use client";

import Link from "next/link";
import { InteractivePortraitTile } from "@/components/landing/InteractivePortraitTile";
import { ScrollFocusText } from "@/components/landing/ScrollFocusText";
import {
  btnPrimaryClass,
  layoutContainerClass,
  layoutSectionYClass,
  typeDisplayTitle,
  typeSectionLabel,
} from "@/lib/brand/design-system";
import {
  fadeInUp,
  motion,
  scaleIn,
  slideInLeft,
  slideInRight,
  staggerContainer,
  transition,
  viewport,
} from "@/components/motion";

export function ClinicalCommitment() {
  return (
    <section id="commitment" className={`bg-transparent ${layoutSectionYClass}`}>
      <div className={layoutContainerClass}>
        <div className="grid items-center gap-10 sm:gap-16 lg:grid-cols-12 lg:gap-20">
          <motion.div
            className="lg:col-span-5"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={slideInLeft}
            transition={transition}
          >
            <span className={typeSectionLabel}>Clinical Commitment</span>
            <ScrollFocusText as="h2" className={`mt-3 sm:mt-4 ${typeDisplayTitle}`}>
              Trusted by people,
              <br />
              not just protocols.
            </ScrollFocusText>
            <p className="mt-5 font-editorial text-base font-light leading-relaxed text-deep-teal/80 sm:mt-6 sm:text-lg">
              Verification is more than a technical process. It is a commitment
              to practitioners, patients, and every decision that depends on
              molecular certainty.
            </p>
            <Link href="/login" className={`mt-6 inline-flex w-full sm:mt-8 sm:w-auto ${btnPrimaryClass} px-8 py-3.5`}>
              Partner Portal
            </Link>
          </motion.div>

          {/* Mobile collage */}
          <motion.div
            className="grid grid-cols-2 gap-2 sm:gap-3 lg:hidden"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={staggerContainer}
          >
            <motion.div className="relative col-span-1 aspect-[3/4]" variants={scaleIn} transition={transition}>
              <InteractivePortraitTile
                src="/brand/humanised-man-blue-sky-portrait.png"
                alt="Man Blue Sky"
                sizes="50vw"
                parallaxIndex={0}
                className="h-full"
              />
            </motion.div>
            <motion.div className="relative col-span-1 aspect-[3/4]" variants={fadeInUp} transition={transition}>
              <InteractivePortraitTile
                src="/brand/humanised-woman-phone-lifestyle.png"
                alt="Phone Lifestyle"
                sizes="50vw"
                parallaxIndex={1}
                className="h-full"
              />
            </motion.div>
            <motion.div className="relative col-span-1 aspect-square" variants={fadeInUp} transition={transition}>
              <InteractivePortraitTile
                src="/brand/humanised-woman-gold-glitter.png"
                alt="Gold Glitter"
                sizes="50vw"
                parallaxIndex={2}
                className="h-full"
              />
            </motion.div>
            <motion.div className="relative col-span-1 aspect-square" variants={fadeInUp} transition={transition}>
              <InteractivePortraitTile
                src="/brand/humanised-man-laughing-portrait.png"
                alt="Laughing Man"
                sizes="50vw"
                parallaxIndex={3}
                className="h-full"
              />
            </motion.div>
            <motion.div className="relative col-span-2 aspect-[16/10]" variants={fadeInUp} transition={transition}>
              <InteractivePortraitTile
                src="/brand/humanised-woman-serene-clouds.png"
                alt="Serene Clouds"
                sizes="100vw"
                parallaxIndex={4}
                className="h-full"
              />
            </motion.div>
          </motion.div>

          {/* Desktop collage */}
          <motion.div
            className="hidden h-[600px] grid-cols-12 gap-4 lg:col-span-7 lg:grid"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={staggerContainer}
          >
            <motion.div className="relative col-span-4 h-full" variants={scaleIn} transition={transition}>
              <InteractivePortraitTile
                src="/brand/humanised-man-blue-sky-portrait.png"
                alt="Man Blue Sky"
                sizes="25vw"
                parallaxIndex={0}
                className="h-full"
              />
            </motion.div>

            <div className="col-span-8 grid grid-rows-2 gap-4">
              <motion.div className="relative row-span-1 min-h-0" variants={fadeInUp} transition={transition}>
                <InteractivePortraitTile
                  src="/brand/humanised-woman-phone-lifestyle.png"
                  alt="Phone Lifestyle"
                  sizes="45vw"
                  parallaxIndex={1}
                  className="h-full min-h-[280px]"
                />
              </motion.div>

              <div className="row-span-1 grid grid-cols-6 gap-4">
                <motion.div className="relative col-span-2 min-h-0" variants={slideInRight} transition={transition}>
                  <InteractivePortraitTile
                    src="/brand/humanised-woman-gold-glitter.png"
                    alt="Gold Glitter"
                    sizes="15vw"
                    parallaxIndex={2}
                    className="h-full min-h-[260px]"
                  />
                </motion.div>

                <div className="col-span-4 grid grid-rows-2 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div className="relative min-h-0" variants={fadeInUp} transition={transition}>
                      <InteractivePortraitTile
                        src="/brand/humanised-man-laughing-portrait.png"
                        alt="Laughing Man"
                        sizes="12vw"
                        parallaxIndex={3}
                        className="h-full min-h-[120px]"
                      />
                    </motion.div>
                    <motion.div className="relative min-h-0" variants={fadeInUp} transition={transition}>
                      <InteractivePortraitTile
                        src="/brand/humanised-woman-braids-laughing.png"
                        alt="Braids Laughing"
                        sizes="12vw"
                        parallaxIndex={4}
                        className="h-full min-h-[120px]"
                      />
                    </motion.div>
                  </div>
                  <motion.div className="relative min-h-0" variants={fadeInUp} transition={transition}>
                    <InteractivePortraitTile
                      src="/brand/humanised-woman-serene-clouds.png"
                      alt="Serene Clouds"
                      sizes="25vw"
                      parallaxIndex={5}
                      className="h-full min-h-[120px]"
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
