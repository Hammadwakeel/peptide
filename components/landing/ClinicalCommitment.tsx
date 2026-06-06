"use client";

import Image from "next/image";
import Link from "next/link";
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
    <section id="commitment" className="bg-pure-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-8 md:px-12 lg:px-20">
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-20">
          <motion.div
            className="lg:col-span-5"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={slideInLeft}
            transition={transition}
          >
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-pacific-teal">
              Clinical Commitment
            </span>
            <h2 className="mt-4 font-serif text-4xl font-light leading-[1.1] tracking-[-0.02em] text-deep-teal md:text-4xl lg:text-5xl">
              Trusted by people,
              <br />
              not just protocols.
            </h2>
            <p className="mt-8 font-serif text-lg font-light leading-relaxed text-deep-teal/80 lg:text-xl">
              Verification is more than a technical process. It is a commitment
              to practitioners, patients, and every decision that depends on
              molecular certainty.
            </p>
            <Link
              href="/login"
              className="mt-10 inline-flex items-center rounded-full bg-deep-teal px-8 py-4 text-sm font-medium text-pure-white transition-all hover:bg-deep-teal/90"
            >
              Partner Portal
            </Link>
          </motion.div>

          <motion.div
            className="grid h-[600px] grid-cols-12 gap-4 lg:col-span-7"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={staggerContainer}
          >
            <motion.div
              className="relative col-span-4 overflow-hidden rounded-3xl"
              variants={scaleIn}
              transition={transition}
            >
              <Image
                src="/brand/humanised-man-blue-sky-portrait.png"
                alt="Man Blue Sky"
                fill
                sizes="(max-width: 1024px) 40vw, 25vw"
                className="object-cover"
              />
            </motion.div>

            <div className="col-span-8 grid grid-rows-2 gap-4">
              <motion.div
                className="relative row-span-1 overflow-hidden rounded-3xl"
                variants={fadeInUp}
                transition={transition}
              >
                <Image
                  src="/brand/humanised-woman-phone-lifestyle.png"
                  alt="Phone Lifestyle"
                  fill
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  className="object-cover"
                />
              </motion.div>

              <div className="row-span-1 grid grid-cols-6 gap-4">
                <motion.div
                  className="relative col-span-2 overflow-hidden rounded-3xl"
                  variants={slideInRight}
                  transition={transition}
                >
                  <Image
                    src="/brand/humanised-woman-gold-glitter.png"
                    alt="Gold Glitter"
                    fill
                    sizes="(max-width: 1024px) 30vw, 15vw"
                    className="object-cover"
                  />
                </motion.div>

                <div className="col-span-4 grid grid-rows-2 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      className="relative overflow-hidden rounded-3xl"
                      variants={fadeInUp}
                      transition={transition}
                    >
                      <Image
                        src="/brand/humanised-man-laughing-portrait.png"
                        alt="Laughing Man"
                        fill
                        sizes="(max-width: 1024px) 40vw, 12vw"
                        className="object-cover"
                      />
                    </motion.div>
                    <motion.div
                      className="relative overflow-hidden rounded-3xl"
                      variants={fadeInUp}
                      transition={transition}
                    >
                      <Image
                        src="/brand/humanised-woman-braids-laughing.png"
                        alt="Braids Laughing"
                        fill
                        sizes="(max-width: 1024px) 40vw, 12vw"
                        className="object-cover"
                      />
                    </motion.div>
                  </div>
                  <motion.div
                    className="relative overflow-hidden rounded-3xl"
                    variants={fadeInUp}
                    transition={transition}
                  >
                    <Image
                      src="/brand/humanised-woman-serene-clouds.png"
                      alt="Serene Clouds"
                      fill
                      sizes="(max-width: 1024px) 80vw, 25vw"
                      className="object-cover"
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
