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
import { typeTagline } from "@/lib/brand/typography";

const navLinks = [
  { href: "#verification", label: "Process" },
  { href: "#standards", label: "Standards" },
  { href: "#integrations", label: "Integrations" },
  { href: "#commitment", label: "Commitment" },
];

const legalLinks = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Service" },
  { href: "#", label: "Compliance" },
];

export function Footer() {
  const year = new Date().getFullYear();

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
          className="grid gap-10 border-b border-white/15 py-12 sm:gap-12 sm:py-16 lg:grid-cols-12 lg:gap-16 lg:py-20"
          variants={staggerContainer}
        >
          <motion.div className="lg:col-span-5" variants={fadeInUp} transition={transition}>
            <Link href="/" aria-label="Frontier Biomed">
              <FrontierLogo variant="dark" />
            </Link>
            <p className={`mt-5 max-w-sm text-pure-white sm:mt-6 ${typeTagline}`}>
              The foundational supply layer of the peptide economy.
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-pure-white/75 sm:mt-4">
              Verified purity at every bond. Domestic by design — built for
              practitioners, pharmacies, and clinical teams.
            </p>
          </motion.div>

          <motion.div className="lg:col-span-3" variants={fadeInUp} transition={transition}>
            <p className="font-sans text-xs font-light text-pure-white/80">Explore</p>
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
            <p className="font-sans text-xs font-light text-pure-white/80">Partner Access</p>
            <p className="mt-4 text-sm leading-relaxed text-pure-white/75 sm:mt-6">
              Join the network of verified suppliers and clinical partners.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex w-full rounded-full bg-pure-white px-6 py-3 text-sm font-light text-deep-teal transition-colors duration-300 hover:bg-coral-blush sm:mt-6 sm:w-auto"
            >
              Partner Portal
            </Link>

            <ul className="mt-8 flex flex-wrap gap-x-4 gap-y-2 sm:mt-10 sm:gap-x-6">
              {legalLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-xs font-light text-pure-white/55 transition-colors hover:text-pure-white/85"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex flex-col gap-3 py-6 text-xs text-pure-white/55 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-8"
          variants={fadeInUp}
          transition={{ ...transition, delay: 0.2 }}
        >
          <p>© {year} Frontier Biomed. All rights reserved.</p>
          <p className={`${typeTagline} text-xs text-pure-white/70`}>
            Molecular certainty, unconditionally.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
