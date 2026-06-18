type PortalCtaMarkProps = {
  className?: string;
};

/** Orbital portal mark — replaces generic arrows on Partner Portal CTAs. */
export function PortalCtaMark({ className = "size-5 sm:size-[1.35rem]" }: PortalCtaMarkProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.34,1.45,0.64,1)] group-hover:rotate-[135deg] group-hover:scale-110 ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 20 20" fill="none" className="size-full">
        <circle
          cx="10"
          cy="10"
          r="6.75"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeDasharray="34 8"
          opacity="0.7"
        />
        <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="10" cy="10" r="0.85" fill="currentColor" />
      </svg>
    </span>
  );
}
