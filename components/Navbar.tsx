import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-deep-teal/10 bg-pure-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 lg:px-12">
        
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center p-2"
          aria-label="Frontier Biomed"
        >
          <Image
            src="/frontier-logo-isocon.png"
            alt="Frontier Biomed"
            width={40}
            height={40}
            priority
            className="h-10 w-10 object-contain"
          />
        </Link>

        {/* CTA */}
        <Link
          href="/login"
          className="rounded-full bg-deep-teal px-6 py-3 text-sm font-medium text-pure-white transition-all duration-300 hover:bg-pacific-teal shadow-sm"
        >
          Partner Portal
        </Link>
      </div>
    </header>
  );
}