import type { ReactNode } from "react";
import { HintPopover } from "@/components/ui/Tippy";

type ApplyFieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

export function ApplyField({
  label,
  htmlFor,
  hint,
  optional,
  className = "",
  children,
}: ApplyFieldProps) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-center gap-2">
        <label htmlFor={htmlFor} className="text-sm font-light text-deep-teal">
          {label}
          {optional ? (
            <span className="ml-1.5 font-light text-deep-teal/40">(optional)</span>
          ) : null}
        </label>
        {hint ? <HintPopover hint={hint} label={`Help for ${label}`} /> : null}
      </div>
      {children}
    </div>
  );
}

export const applyInputClassName =
  "w-full rounded-xl border border-deep-teal/12 bg-pure-white px-4 py-3 text-sm text-deep-teal shadow-sm shadow-deep-teal/[0.03] outline-none transition-all placeholder:text-deep-teal/30 focus:border-pacific-teal focus:ring-4 focus:ring-pacific-teal/10";

export const applySelectClassName = applyInputClassName;
