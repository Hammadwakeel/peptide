import { ArrowRight } from "lucide-react";

type PortalCtaMarkProps = {
  className?: string;
  /** Glass / video backgrounds — white disc, dark arrow */
  variant?: "on-media" | "on-light";
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "size-7 [&_svg]:size-3.5",
  md: "size-9 [&_svg]:size-4",
  lg: "size-10 [&_svg]:size-[18px]",
} as const;

/** Arrow-in-disc mark for Partner Portal CTAs — right by default, tilts up on hover. */
export function PortalCtaMark({
  className = "",
  variant = "on-media",
  size = "sm",
}: PortalCtaMarkProps) {
  const onMedia = variant === "on-media";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full shadow-[0_1px_2px_rgb(0_0_0/0.1)] ${
        onMedia ? "bg-pure-white" : "bg-deep-teal"
      } ${sizeClasses[size]} ${className}`}
      aria-hidden
    >
      <ArrowRight
        strokeWidth={2.25}
        className={`transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 ${
          onMedia ? "text-deep-teal" : "text-pure-white"
        }`}
      />
    </span>
  );
}
