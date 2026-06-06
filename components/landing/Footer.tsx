import Link from "next/link";
import { FrontierLogo } from "@/components/FrontierLogo";

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
    <footer className="bg-deep-teal text-pure-white">
      <div className="mx-auto max-w-[1400px] px-8 md:px-12 lg:px-20">
        <div className="grid gap-12 border-b border-pure-white/10 py-16 lg:grid-cols-12 lg:gap-16 lg:py-20">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Link href="/" aria-label="Frontier Biomed">
              <FrontierLogo variant="dark" />
            </Link>
            <p className="mt-6 max-w-sm font-serif text-2xl font-light leading-snug tracking-[-0.02em] text-pure-white/90">
              The foundational supply layer of the peptide economy.
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-pure-white/55">
              Verified purity at every bond. Domestic by design — built for
              practitioners, pharmacies, and clinical teams.
            </p>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-3">
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-pacific-teal">
              Explore
            </p>
            <ul className="mt-6 space-y-3">
              {navLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm font-medium text-pure-white/75 transition-colors hover:text-pure-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partner + Legal */}
          <div className="lg:col-span-4">
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-pacific-teal">
              Partner Access
            </p>
            <p className="mt-6 text-sm leading-relaxed text-pure-white/55">
              Join the network of verified suppliers and clinical partners.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-full bg-pacific-teal px-6 py-3 text-sm font-medium text-pure-white transition-colors hover:bg-pacific-teal/90"
            >
              Partner Portal
            </Link>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
              {legalLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-xs font-medium text-pure-white/45 transition-colors hover:text-pure-white/75"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-8 text-xs text-pure-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Frontier Biomed. All rights reserved.</p>
          <p className="font-mono uppercase tracking-[0.2em]">
            Molecular certainty, unconditionally.
          </p>
        </div>
      </div>
    </footer>
  );
}
