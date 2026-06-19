"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { PortalCtaMark } from "@/components/landing/PortalCtaMark";
import { Tooltip } from "@/components/ui/Tippy";
import { FrontierLogo } from "@/components/FrontierLogo";
import { fadeIn, motion, transition } from "@/components/motion";
import {
  glassNavLinksClass,
  glassNavMenuClass,
  glassOnboardCtaClass,
  landingNavLinkClass,
  landingNavShellClass,
  landingPillHeightClass,
  landingTopRailClass,
  landingTopShellClass,
  navSolidShellClass,
} from "@/lib/brand/design-system";
import { LANDING_CTA, LANDING_NAV_LINKS } from "@/lib/landing/content";

const navLinks = LANDING_NAV_LINKS;

function homeHref(hash: string) {
  return hash.startsWith("#") ? `/${hash}` : hash;
}

type NavbarProps = {
  /** Glass nav over hero video; solidifies when the hero leaves the viewport. */
  heroGlass?: boolean;
};

export function Navbar({ heroGlass = false }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string>(navLinks[0].href);
  const [heroSolid, setHeroSolid] = useState(false);
  const onLanding = pathname === "/";
  const glassMode = heroGlass && !heroSolid;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!heroGlass) return;

    const hero = document.getElementById("hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroSolid(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [heroGlass]);

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

  const linksShellClass = glassMode ? glassNavLinksClass : navSolidShellClass;

  return (
    <motion.header
      className={`sticky top-0 z-50 pt-4 ${landingTopShellClass}`}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ ...transition, duration: 0.5 }}
    >
      <div className={`${landingTopRailClass} grid grid-cols-[auto_1fr_auto] items-center gap-3 lg:gap-6`}>
        <Link href="/" aria-label="FrontierBioMed" onClick={closeMenu} className="shrink-0 justify-self-start">
          <FrontierLogo
            variant={glassMode ? "white" : "black"}
            priority
            className="!h-7 w-auto object-contain object-left sm:!h-8"
          />
        </Link>

        <nav
          className={`hidden w-fit shrink-0 justify-self-center transition-[background-color,border-color,box-shadow] duration-300 md:inline-flex ${landingNavShellClass} ${linksShellClass}`}
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
                className={`${landingNavLinkClass} ${
                  glassMode
                    ? active
                      ? "text-pure-white"
                      : "text-pure-white/72 hover:text-pure-white"
                    : active
                      ? "text-deep-teal"
                      : "text-deep-teal/60 hover:text-deep-teal"
                }`}
              >
                {active ? (
                  <motion.span
                    layoutId="navbar-active-pill"
                    className={`absolute inset-0 rounded-full ${
                      glassMode ? "glass-ios-pill-active" : "bg-pacific-teal/10"
                    }`}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center justify-self-end gap-2 sm:gap-2.5">
          <Link
            href={LANDING_CTA.onboard.href}
            className={`hidden md:inline-flex ${
              glassMode
                ? glassOnboardCtaClass
                : `inline-flex ${landingPillHeightClass} items-center rounded-full bg-deep-teal pl-4 pr-1 text-sm font-light leading-none text-pure-white transition-[background-color] duration-300 hover:bg-pacific-teal lg:pl-5`
            }`}
          >
            <span>{LANDING_CTA.onboard.label}</span>
            {glassMode ? <PortalCtaMark /> : null}
          </Link>

          <Link
            href={LANDING_CTA.onboard.href}
            className={`inline-flex md:hidden ${
              glassMode
                ? `${glassOnboardCtaClass} pl-3.5 pr-1 text-xs`
                : `inline-flex ${landingPillHeightClass} items-center rounded-full bg-deep-teal px-3.5 text-xs font-light leading-none text-pure-white transition-[background-color] duration-300 hover:bg-pacific-teal`
            }`}
          >
            <span>{LANDING_CTA.onboardShort.label}</span>
            {glassMode ? <PortalCtaMark /> : null}
          </Link>

          <Tooltip content={menuOpen ? "Close menu" : "Open menu"}>
            <button
              type="button"
              className={`relative z-[1] inline-flex size-9 items-center justify-center rounded-full md:hidden ${
                glassMode
                  ? "glass-ios-button text-pure-white"
                  : "border border-deep-teal/10 bg-pure-white text-deep-teal transition-transform duration-300 hover:scale-105 active:scale-95"
              }`}
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
          className={`relative z-[1] mx-auto mt-3 p-2 md:hidden ${landingTopRailClass} ${
            glassMode
              ? glassNavMenuClass
              : "glass-ios-solid glass-ios-menu"
          }`}
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
                    className={`block rounded-xl px-4 py-3 text-sm font-light transition-colors duration-300 ${
                      glassMode
                        ? active
                          ? "glass-ios-pill-active text-pure-white"
                          : "text-pure-white/75 hover:bg-pure-white/10 hover:text-pure-white"
                        : active
                          ? "bg-pacific-teal/10 text-deep-teal"
                          : "text-deep-teal/70 hover:bg-deep-teal/5 hover:text-deep-teal"
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
