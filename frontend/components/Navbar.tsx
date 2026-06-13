"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Tooltip } from "@/components/ui/Tippy";
import { FrontierLogo } from "@/components/FrontierLogo";
import { fadeIn, motion, transition } from "@/components/motion";

const navLinks = [
  { href: "#verification", label: "Process", sectionId: "verification" },
  { href: "#standards", label: "Standards", sectionId: "standards" },
  { href: "#integrations", label: "Integrations", sectionId: "integrations" },
  { href: "#commitment", label: "Commitment", sectionId: "commitment" },
] as const;

function homeHref(hash: string) {
  return hash.startsWith("#") ? `/${hash}` : hash;
}

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string>(navLinks[0].href);
  const onLanding = pathname === "/";

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!onLanding) return;

    const sectionIds = navLinks.map((link) => link.sectionId);
    const visibleSections = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibleSections.set(entry.target.id, entry.intersectionRatio);
        }

        let bestId = sectionIds[0];
        let bestRatio = 0;

        for (const id of sectionIds) {
          const ratio = visibleSections.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }

        if (bestRatio > 0) {
          setActiveHref(`#${bestId}`);
        }
      },
      {
        rootMargin: "-32% 0px -32% 0px",
        threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
      },
    );

    for (const id of sectionIds) {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    }

    return () => observer.disconnect();
  }, [onLanding]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  function handleNavClick(href: string) {
    setActiveHref(href);
    closeMenu();
  }

  function isActive(href: string) {
    if (onLanding) return activeHref === href;
    return pathname === href;
  }

  return (
    <motion.header
      className="sticky top-0 z-50 flex w-full justify-center px-4 pt-4 sm:px-6"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ ...transition, duration: 0.5 }}
    >
      <div className="relative mx-auto grid w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center rounded-full border border-white/20 bg-pacific-teal px-6 py-2.5 shadow-[0_8px_32px_rgba(1,26,36,0.12)] sm:px-10 sm:py-3 lg:px-12">
        <Link href="/" aria-label="Frontier Biomed" onClick={closeMenu} className="justify-self-start">
          <FrontierLogo variant="dark" priority />
        </Link>

        <nav
          className="hidden items-center gap-5 justify-self-center md:flex lg:gap-8"
          aria-label="Main"
        >
          {navLinks.map(({ href, label }) => {
            const active = isActive(href);
            const linkHref = onLanding ? href : homeHref(href);

            return (
              <Link
                key={label}
                href={linkHref}
                onClick={() => handleNavClick(href)}
                className={`relative whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors duration-300 lg:px-4 ${
                  active ? "text-deep-teal" : "text-pure-white/70 hover:text-pure-white"
                }`}
              >
                {active ? (
                  <motion.span
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 rounded-full bg-pure-white shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-self-end gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden rounded-full bg-pure-white px-5 py-2.5 text-sm font-medium text-deep-teal shadow-sm transition-all duration-300 hover:bg-coral-blush md:inline-flex"
          >
            Partner Portal
          </Link>

          <Link
            href="/login"
            className="inline-flex rounded-full bg-pure-white px-4 py-2.5 text-xs font-medium text-deep-teal shadow-sm transition-all duration-300 hover:bg-coral-blush md:hidden"
          >
            Portal
          </Link>

          <Tooltip content={menuOpen ? "Close menu" : "Open menu"}>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-pure-white md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </Tooltip>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          className="mx-auto mt-3 w-full max-w-5xl rounded-3xl border border-white/20 bg-pacific-teal p-2 shadow-lg md:hidden"
        >
          <ul className="space-y-1">
            {navLinks.map(({ href, label }) => {
              const active = isActive(href);
              const linkHref = onLanding ? href : homeHref(href);

              return (
                <li key={label}>
                  <Link
                    href={linkHref}
                    onClick={() => handleNavClick(href)}
                    className={`block rounded-2xl px-4 py-3 text-base font-medium transition-colors duration-300 ${
                      active
                        ? "bg-pure-white text-deep-teal shadow-sm"
                        : "text-pure-white/70 hover:bg-white/10 hover:text-pure-white"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </motion.header>
  );
}
