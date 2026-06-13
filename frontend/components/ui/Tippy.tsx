"use client";

import TippyBase from "@tippyjs/react";
import type { TippyProps } from "@tippyjs/react";
import {
  cloneElement,
  isValidElement,
  useRef,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away-subtle.css";

export const FRONTIER_TIPPY_PROPS = {
  animation: "shift-away-subtle",
  duration: [200, 150] as [number, number],
  arrow: true,
  theme: "frontier",
  offset: [0, 8] as [number, number],
};

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  ref.current = value;
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (value: T | null) => {
    for (const ref of refs) {
      assignRef(ref, value);
    }
  };
}

function withAnchorRef(children: ReactElement, anchorRef: Ref<Element>) {
  const childRef = (children.props as { ref?: Ref<Element> }).ref;

  return cloneElement(children, {
    ref: mergeRefs(anchorRef, childRef),
  } as { ref: (node: Element | null) => void });
}

type TooltipProps = Omit<TippyProps, "content" | "children"> & {
  content: ReactNode;
  children: ReactElement;
};

export function Tooltip({ content, children, ...props }: TooltipProps) {
  const anchorRef = useRef<Element>(null);

  if (!content || !isValidElement(children)) return children;

  return (
    <>
      {withAnchorRef(children, anchorRef)}
      <TippyBase
        reference={anchorRef as RefObject<Element>}
        content={content}
        {...FRONTIER_TIPPY_PROPS}
        {...props}
      />
    </>
  );
}

type PopoverProps = Omit<TippyProps, "content" | "interactive" | "trigger" | "children"> & {
  content: ReactNode;
  children: ReactElement;
  trigger?: TippyProps["trigger"];
};

export function Popover({
  content,
  children,
  trigger = "click",
  maxWidth = 280,
  ...props
}: PopoverProps) {
  const anchorRef = useRef<Element>(null);

  if (!content || !isValidElement(children)) return children;

  return (
    <>
      {withAnchorRef(children, anchorRef)}
      <TippyBase
        reference={anchorRef as RefObject<Element>}
        content={content}
        interactive
        trigger={trigger}
        maxWidth={maxWidth}
        placement="top"
        {...FRONTIER_TIPPY_PROPS}
        {...props}
      />
    </>
  );
}

type HintPopoverProps = {
  hint: string;
  label?: string;
};

export function HintPopover({ hint, label = "Field help" }: HintPopoverProps) {
  return (
    <Popover content={<p className="text-sm leading-relaxed">{hint}</p>} trigger="mouseenter focus click">
      <button
        type="button"
        className="inline-flex size-5 items-center justify-center rounded-full border border-deep-teal/15 text-[11px] font-light text-deep-teal/50 transition-colors hover:bg-pacific-teal/12 hover:text-pacific-teal"
        aria-label={label}
      >
        ?
      </button>
    </Popover>
  );
}

type TruncateTooltipProps = {
  content: string;
  children: ReactElement;
  maxWidth?: number;
};

export function TruncateTooltip({ content, children, maxWidth = 260 }: TruncateTooltipProps) {
  if (!content.trim()) return children;

  return (
    <Tooltip content={content} maxWidth={maxWidth}>
      {children}
    </Tooltip>
  );
}
