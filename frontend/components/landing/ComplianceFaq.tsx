"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { layoutContainerClass } from "@/components/landing/LandingSectionHeader";
import {
  fadeInUp,
  staggerContainer,
  transition,
  viewport,
} from "@/components/motion";
import { layoutSectionYClass, typeSectionLabel } from "@/lib/brand/design-system";
import { LANDING_COMPLIANCE_FAQ } from "@/lib/landing/content";

type FaqItemProps = {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
};

function FaqItem({ question, answer, isOpen, onToggle }: FaqItemProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="border-b border-deep-teal/10 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start justify-between gap-4 py-5 text-left transition-colors hover:text-pacific-teal sm:py-6"
      >
        <span className="font-sans text-base font-medium tracking-[-0.01em] text-deep-teal sm:text-lg">
          {question}
        </span>
        <ChevronDown
          className={`mt-0.5 size-5 shrink-0 text-pacific-teal transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-7 text-deep-teal/70 sm:pb-6 sm:text-base">
              {answer}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function ComplianceFaq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      id="compliance"
      className={`relative overflow-hidden bg-pure-white ${layoutSectionYClass}`}
      aria-labelledby="compliance-faq-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-pacific-teal/6 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-deep-teal/5 blur-3xl" />
      </div>

      <div className={`relative ${layoutContainerClass}`}>
        <motion.p
          id="compliance-faq-heading"
          className={typeSectionLabel}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeInUp}
          transition={transition}
        >
          {LANDING_COMPLIANCE_FAQ.label}
        </motion.p>

        <motion.ul
          className="mt-8 flex flex-wrap gap-2 sm:mt-10 sm:gap-2.5"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer}
          aria-label="Compliance badges"
        >
          {LANDING_COMPLIANCE_FAQ.badges.map((badge) => (
            <motion.li key={badge} variants={fadeInUp} transition={transition}>
              <span className="inline-flex items-center gap-2 rounded-full border border-deep-teal/10 bg-[#FEF5F2]/80 px-4 py-2 font-sans text-sm font-medium text-deep-teal backdrop-blur-sm sm:px-5 sm:py-2.5">
                <ShieldCheck className="size-4 shrink-0 text-pacific-teal" aria-hidden />
                {badge}
              </span>
            </motion.li>
          ))}
        </motion.ul>

        <motion.div
          className="mt-10 rounded-[1.5rem] border border-deep-teal/8 bg-[#FEF5F2]/50 px-5 sm:mt-12 sm:rounded-[2rem] sm:px-8 lg:px-10"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeInUp}
          transition={{ ...transition, delay: 0.06 }}
        >
          {LANDING_COMPLIANCE_FAQ.faqs.map((faq, index) => (
            <FaqItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex((current) => (current === index ? -1 : index))}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
