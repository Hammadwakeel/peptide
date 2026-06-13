"use client";

type ApplyTab = {
  id: string;
  label: string;
};

type ApplyTabsProps = {
  tabs: ApplyTab[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: "primary" | "secondary";
  className?: string;
};

export function ApplyTabs({
  tabs,
  activeId,
  onChange,
  variant = "primary",
  className = "",
}: ApplyTabsProps) {
  const isPrimary = variant === "primary";

  return (
    <div
      role="tablist"
      aria-label="Form sections"
      className={`flex gap-1 ${isPrimary ? "rounded-2xl border border-deep-teal/10 bg-deep-teal/[0.03] p-1" : "border-b border-deep-teal/10"} ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-tour={`apply-tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={
              isPrimary
                ? `flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-light transition-all sm:px-4 ${
                    isActive
                      ? "bg-pure-white text-deep-teal shadow-sm shadow-deep-teal/10"
                      : "text-deep-teal/50 hover:text-deep-teal/75"
                  }`
                : `relative -mb-px border-b-2 px-3 py-2.5 text-sm font-light transition-colors sm:px-4 ${
                    isActive
                      ? "border-pacific-teal text-deep-teal"
                      : "border-transparent text-deep-teal/45 hover:text-deep-teal/70"
                  }`
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
