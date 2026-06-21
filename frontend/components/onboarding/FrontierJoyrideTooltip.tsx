"use client";

import type { TooltipRenderProps } from "react-joyride";

export function FrontierJoyrideTooltip({
  backProps,
  continuous,
  index,
  isLastStep,
  primaryProps,
  skipProps,
  step,
  tooltipProps,
  size,
}: TooltipRenderProps) {
  return (
    <div
      {...tooltipProps}
      className="w-[min(calc(100vw-2rem),22rem)] overflow-hidden rounded-2xl border border-deep-teal/10 bg-pure-white text-left shadow-2xl shadow-deep-teal/15"
    >
      <div className="px-5 py-4">
        {step.title ? (
          <p className="font-sans text-xl font-light leading-snug text-deep-teal">{step.title}</p>
        ) : null}
        {step.content ? (
          <p className={`text-sm leading-relaxed text-deep-teal/70 ${step.title ? "mt-2" : ""}`}>
            {step.content}
          </p>
        ) : null}
        {typeof step.data?.actionHint === "string" ? (
          <p className="mt-3 rounded-lg border border-pacific-teal/20 bg-pacific-teal/8 px-3 py-2 text-xs font-light text-deep-teal">
            {step.data.actionHint}
          </p>
        ) : null}
        {continuous && size > 1 ? (
          <p className="mt-3 font-sans text-[10px] font-light text-pacific-teal">
            Step {index + 1} of {size}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-deep-teal/8 bg-deep-teal/[0.02] px-5 py-3">
        <button
          type="button"
          {...skipProps}
          className="text-sm text-deep-teal/50 transition-colors hover:text-deep-teal"
        >
          {skipProps.title}
        </button>

        <div className="flex items-center gap-2">
          {index > 0 ? (
            <button
              type="button"
              {...backProps}
              className="rounded-full border border-deep-teal/15 px-3 py-1.5 text-sm font-light text-deep-teal transition-colors hover:bg-pacific-teal/12 hover:text-pacific-teal"
            >
              {backProps.title}
            </button>
          ) : null}
          <button
            type="button"
            {...primaryProps}
            className="rounded-full bg-deep-teal px-4 py-1.5 text-sm font-light text-pure-white transition-colors hover:bg-pacific-teal"
          >
            {primaryProps.title}
          </button>
        </div>
      </div>
    </div>
  );
}
