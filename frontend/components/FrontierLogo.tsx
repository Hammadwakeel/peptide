import Image from "next/image";

type FrontierLogoProps = {
  /** Deep teal on light surfaces (navbar). White on dark surfaces (footer). */
  variant?: "light" | "dark";
  /** Icon only — for collapsed sidebar */
  compact?: boolean;
  className?: string;
  priority?: boolean;
};

export function FrontierLogo({
  variant = "light",
  compact = false,
  className = "",
  priority = false,
}: FrontierLogoProps) {
  const isDark = variant === "dark";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Image
        src="/frontier-logo-isocon.png"
        alt=""
        width={36}
        height={36}
        className={`h-9 w-9 shrink-0 object-contain ${isDark ? "brightness-0 invert" : ""}`}
        priority={priority}
      />
      {compact ? null : (
        <span className={`flex flex-col ${isDark ? "text-pure-white" : "text-deep-teal"}`}>
          <span className="font-sans text-lg font-light leading-none tracking-[-0.05em]">
            Frontier
          </span>
          <span className="mt-0.5 font-sans text-[10px] font-light uppercase leading-none tracking-[-0.05em]">
            Biomed
          </span>
        </span>
      )}
    </span>
  );
}
