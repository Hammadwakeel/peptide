"use client";

import Link from "next/link";
import { FrontierLogo } from "@/components/FrontierLogo";
import { fadeIn, motion, transition } from "@/components/motion";

export function Navbar() {
  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-deep-teal/5 bg-pure-white/70 backdrop-blur-lg"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ ...transition, duration: 0.5 }}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 lg:px-12">
        <Link href="/" aria-label="Frontier Biomed">
          <FrontierLogo variant="light" priority />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="#verification"
            className="text-sm font-medium text-deep-teal/80 transition-colors hover:text-deep-teal"
          >
            Process
          </Link>
          <Link
            href="#standards"
            className="text-sm font-medium text-deep-teal/80 transition-colors hover:text-deep-teal"
          >
            Standards
          </Link>
          <Link
            href="#commitment"
            className="text-sm font-medium text-deep-teal/80 transition-colors hover:text-deep-teal"
          >
            Commitment
          </Link>
          <Link
            href="/integrations"
            className="text-sm font-medium text-deep-teal/80 transition-colors hover:text-deep-teal"
          >
            Integrations
          </Link>
        </nav>

        <Link
          href="/login"
          className="rounded-full bg-deep-teal px-6 py-3 text-sm font-medium text-pure-white shadow-sm transition-all duration-300 hover:bg-pacific-teal"
        >
          Partner Portal
        </Link>
      </div>
    </motion.header>
  );
}
