"use client";

import {
  fadeInUp,
  motion,
  staggerContainer,
  transition,
  viewport,
} from "@/components/motion";

const steps = [
  {
    number: "01",
    title: "Raw Bond Analysis",
    description:
      "Automated spectroscopic analysis identifies contaminants at the molecular level before synthesis begins.",
    bg: "bg-[#E6F0EE]",
  },
  {
    number: "02",
    title: "Controlled Synthesis",
    description:
      "Our domestic, proprietary synthesis environment eliminates variables introduced by international shipping.",
    bg: "bg-[#E6F0EE]",
  },
  {
    number: "03",
    title: "Blockchain Certification",
    description:
      "Every batch receives an immutable digital certificate, verifiable by the practitioner in real-time.",
    bg: "bg-[#E6F0EE]",
  },
];

export function VerificationProcess() {
  return (
    <section id="verification" className="bg-pure-white py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 md:px-12 lg:px-20 xl:px-28">
        <motion.div
          className="max-w-5xl"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeInUp}
          transition={transition}
        >
          <span className="inline-block rounded-full bg-[#E6F0EE] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C6384] sm:px-4 sm:text-xs sm:tracking-[0.2em]">
            Verification Process
          </span>
          <h2 className="mt-4 font-serif text-3xl font-light leading-[1.08] tracking-[-0.03em] text-deep-teal sm:mt-6 sm:text-5xl md:text-6xl lg:text-7xl">
            Precision-engineered
            <br />
            verification.
          </h2>
        </motion.div>

        <motion.div
          className="mt-10 grid gap-4 sm:mt-16 sm:gap-8 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer}
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              className={`flex flex-col rounded-2xl ${step.bg} p-6 transition-all duration-300 sm:rounded-[2rem] sm:p-10 sm:hover:shadow-lg`}
              variants={fadeInUp}
              transition={transition}
            >
              <div className="self-end font-mono text-lg text-[#1C6384]/60 sm:text-xl">
                {step.number}
              </div>

              <div className="mt-4 flex flex-grow flex-col sm:mt-6">
                <h3 className="font-serif text-2xl font-light text-deep-teal sm:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-deep-teal/70 sm:mt-4 sm:text-base">
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
