import type { ReactNode } from "react";

type ApplySectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function ApplySection({ title, description, children }: ApplySectionProps) {
  return (
    <section className="overflow-hidden rounded-[1.25rem] border border-deep-teal/10 bg-pure-white shadow-sm shadow-deep-teal/[0.04]">
      <div className="border-b border-deep-teal/8 bg-gradient-to-r from-pacific-teal/[0.05] to-transparent px-5 py-4 sm:px-6">
        <h2 className="font-sans text-lg font-light tracking-[-0.02em] text-deep-teal sm:text-xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-deep-teal/55">
            {description}
          </p>
        ) : null}
      </div>
      <div className="space-y-4 p-5 sm:p-6">{children}</div>
    </section>
  );
}
