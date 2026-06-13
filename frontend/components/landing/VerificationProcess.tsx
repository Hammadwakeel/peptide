"use client";

import { LandingSectionHeader, layoutContainerClass } from "@/components/landing/LandingSectionHeader";
import {
  fadeInUp,
  motion,
  staggerContainer,
  transition,
  viewport,
} from "@/components/motion";
import { layoutSectionYClass, shapeProcessCards } from "@/lib/brand/design-system";

const steps = [
  {
    number: "01",
    title: "Raw Bond Analysis",
    description:
      "Automated spectroscopic analysis identifies contaminants at the molecular level before synthesis begins.",
    cardClass: "bg-coral-blush text-deep-teal",
    numberClass: "text-pacific-teal",
    bodyClass: "text-deep-teal/75",
    hoverClass: "sm:hover:shadow-md sm:hover:brightness-[0.98]",
    shapeClass: shapeProcessCards[0],
  },
  {
    number: "02",
    title: "Controlled Synthesis",
    description:
      "Our domestic, proprietary synthesis environment eliminates variables introduced by international shipping.",
    cardClass: "bg-pacific-teal text-pure-white",
    numberClass: "text-pure-white/70",
    bodyClass: "text-pure-white/85",
    hoverClass: "sm:hover:shadow-md sm:hover:brightness-110",
    shapeClass: shapeProcessCards[1],
  },
  {
    number: "03",
    title: "Blockchain Certification",
    description:
      "Every batch receives an immutable digital certificate, verifiable by the practitioner in real-time.",
    cardClass: "bg-deep-teal text-pure-white",
    numberClass: "text-pure-white/70",
    bodyClass: "text-pure-white/85",
    hoverClass: "sm:hover:shadow-md sm:hover:brightness-125",
    shapeClass: shapeProcessCards[2],
  },
];

export function VerificationProcess() {
  return (
    <section id="verification" className={`bg-pure-white ${layoutSectionYClass}`}>
      <div className={layoutContainerClass}>
        <LandingSectionHeader
          align="left"
          label="Verification Process"
          title={
            <>
              Precision-engineered
              <br />
              verification.
            </>
          }
          className="mb-10 sm:mb-12"
        />

        <motion.div
          className="grid gap-4 sm:gap-8 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer}
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              className={`flex flex-col p-6 transition-[box-shadow,filter] duration-300 sm:p-10 ${step.shapeClass} ${step.cardClass} ${step.hoverClass}`}
              variants={fadeInUp}
              transition={transition}
            >
              <div className={`self-end font-sans text-base font-light ${step.numberClass}`}>
                {step.number}
              </div>

              <div className="mt-4 flex flex-grow flex-col sm:mt-6">
                <h3 className="font-sans text-xl font-light sm:text-2xl">{step.title}</h3>
                <p className={`mt-3 text-sm leading-7 sm:mt-4 sm:text-base ${step.bodyClass}`}>
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
