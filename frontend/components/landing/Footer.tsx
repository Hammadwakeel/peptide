"use client";

import Link from "next/link";
import { FrontierLogo } from "@/components/FrontierLogo";
import {
  fadeInUp,
  motion,
  staggerContainer,
  transition,
  viewport,
} from "@/components/motion";
import { layoutContainerClass } from "@/lib/brand/design-system";
import { LANDING_FOOTER, LANDING_NAV_LINKS } from "@/lib/landing/content";
import { typeTagline } from "@/lib/brand/typography";

const navLinks = LANDING_NAV_LINKS.map(({ href, label }) => ({ href, label }));

export function Footer() {
  const year = new Date().getFullYear();
  const { contact } = LANDING_FOOTER;

  return (
    <motion.footer
      className="bg-pacific-teal text-pure-white"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={staggerContainer}
    >
      <div className={layoutContainerClass}>
        <motion.div
          className="grid gap-10 border-b border-pure-white/15 py-12 sm:gap-12 sm:py-16 lg:grid-cols-12 lg:gap-16 lg:py-20"
          variants={staggerContainer}
        >
          <motion.div className="lg:col-span-5" variants={fadeInUp} transition={transition}>
            <Link href="/" aria-label="Frontier BioMed">
              <FrontierLogo variant="white" />
            </Link>
            <p className={`mt-5 max-w-md text-pure-white sm:mt-6 ${typeTagline}`}>
              {LANDING_FOOTER.tagline}
            </p>
          </motion.div>

          <motion.div className="lg:col-span-3" variants={fadeInUp} transition={transition}>
            <p className="font-sans text-xs font-light uppercase tracking-[0.04em] text-pure-white/80">
              Explore
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:mt-6 sm:block sm:space-y-3">
              {navLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm font-light text-pure-white/80 transition-colors hover:text-pure-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div className="lg:col-span-4" variants={fadeInUp} transition={transition}>
            <p className="font-sans text-xs font-light uppercase tracking-[0.04em] text-pure-white/80">
              Contact
            </p>
            <address className="mt-4 space-y-2 not-italic sm:mt-6">
              <p>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sm font-light text-pure-white/80 transition-colors hover:text-pure-white"
                >
                  {contact.email}
                </a>
              </p>
              <p className="text-sm font-light text-pure-white/75">{contact.company}</p>
              <p className="text-sm leading-relaxed text-pure-white/75">{contact.address}</p>
            </address>

            <p className="mt-8 font-sans text-xs font-light uppercase tracking-[0.04em] text-pure-white/80 sm:mt-10">
              Legal
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 sm:gap-x-6">
              {LANDING_FOOTER.legalLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm font-light text-pure-white/75 transition-colors hover:text-pure-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        <motion.p
          className="border-b border-pure-white/15 py-6 text-xs leading-relaxed text-pure-white/55 sm:py-8 sm:text-[0.8125rem]"
          variants={fadeInUp}
          transition={transition}
        >
          {LANDING_FOOTER.disclaimer}
        </motion.p>

        <motion.div
          className="flex flex-col gap-2 py-6 text-xs text-pure-white/55 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-8"
          variants={fadeInUp}
          transition={{ ...transition, delay: 0.1 }}
        >
          <p>© {year} {contact.company}. All rights reserved.</p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
