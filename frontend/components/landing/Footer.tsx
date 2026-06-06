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

const navLinks = [
  { href: "#verification", label: "Process" },
  { href: "#standards", label: "Standards" },
  { href: "#commitment", label: "Commitment" },
  { href: "/integrations", label: "Integrations" },
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
      className="border-t border-deep-teal/10 bg-pure-white text-deep-teal"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={staggerContainer}
    >
      <div className="mx-auto max-w-[1400px] px-8 md:px-12 lg:px-20">
        <motion.div
          className="grid gap-12 border-b border-deep-teal/10 py-16 lg:grid-cols-12 lg:gap-16 lg:py-20"
          variants={staggerContainer}
        >
          <motion.div className="lg:col-span-5" variants={fadeInUp} transition={transition}>
            <Link href="/" aria-label="Frontier Biomed">
              <FrontierLogo variant="light" />
            </Link>
            <p className="mt-6 max-w-sm font-serif text-2xl font-light leading-snug tracking-[-0.02em] text-deep-teal">
              The foundational supply layer of the peptide economy.
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-deep-teal/60">
              Verified purity at every bond. Domestic by design — built for
              practitioners, pharmacies, and clinical teams.
            </p>
          </motion.div>

          <motion.div className="lg:col-span-3" variants={fadeInUp} transition={transition}>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-pacific-teal">
              Explore
            </p>
            <ul className="mt-6 space-y-3">
              {navLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm font-medium text-deep-teal/75 transition-colors hover:text-deep-teal"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div className="lg:col-span-4" variants={fadeInUp} transition={transition}>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-pacific-teal">
              Partner Access
            </p>
            <p className="mt-6 text-sm leading-relaxed text-deep-teal/60">
              Join the network of verified suppliers and clinical partners.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-full bg-deep-teal px-6 py-3 text-sm font-medium text-pure-white transition-colors hover:bg-pacific-teal"
            >
              Partner Portal
            </Link>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
              {legalLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-xs font-medium text-deep-teal/50 transition-colors hover:text-deep-teal/75"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex flex-col gap-4 py-8 text-xs text-deep-teal/45 sm:flex-row sm:items-center sm:justify-between"
          variants={fadeInUp}
          transition={{ ...transition, delay: 0.2 }}
        >
          <p>© {year} Frontier Biomed. All rights reserved.</p>
          <p className="font-mono uppercase tracking-[0.2em]">
            Molecular certainty, unconditionally.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
