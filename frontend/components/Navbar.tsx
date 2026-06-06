"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { FrontierLogo } from "@/components/FrontierLogo";
import { fadeIn, motion, transition } from "@/components/motion";

const navLinks = [
  { href: "#verification", label: "Process" },
  { href: "#standards", label: "Standards" },
  { href: "#commitment", label: "Commitment" },
  { href: "/integrations", label: "Integrations" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-deep-teal/5 bg-pure-white/70 backdrop-blur-lg"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ ...transition, duration: 0.5 }}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-12">
        <Link href="/" aria-label="Frontier Biomed" onClick={closeMenu}>
          <FrontierLogo variant="light" priority />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="text-sm font-medium text-deep-teal/80 transition-colors hover:text-deep-teal"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-full bg-deep-teal px-4 py-2.5 text-xs font-medium text-pure-white shadow-sm transition-all duration-300 hover:bg-pacific-teal sm:px-6 sm:py-3 sm:text-sm"
          >
            <span className="max-sm:hidden">Partner Portal</span>
            <span className="sm:hidden">Portal</span>
          </Link>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-deep-teal/10 text-deep-teal md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          className="border-t border-deep-teal/10 bg-pure-white/95 px-4 py-6 md:hidden"
        >
          <ul className="space-y-1">
            {navLinks.map(({ href, label }) => (
              <li key={label}>
                <Link
                  href={href}
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 text-base font-medium text-deep-teal/80 transition-colors hover:bg-deep-teal/5 hover:text-deep-teal"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </motion.header>
  );
}
