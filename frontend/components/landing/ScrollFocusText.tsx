"use client";

import {
  Fragment,
  isValidElement,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";

export type ScrollFocusTone = "light" | "dark";

type ScrollFocusHeadingProps = {
  as?: "h1" | "h2" | "h3";
  children: ReactNode;
  className?: string;
  tone?: ScrollFocusTone;
};

type WordToken = { kind: "word"; text: string } | { kind: "break" };

const MOTION_TAGS = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
} as const;

/** Pacific Teal — scroll highlight accent */
const HIGHLIGHT_RGB = [13, 113, 123] as const;

const INACTIVE_RGB = {
  light: [1, 26, 36] as const,
  dark: [255, 255, 255] as const,
} as const;

function stripTextColor(className: string) {
  return className
    .replace(/\b!?(text-\[[^\]]+\]|text-[a-z]+(?:-[a-z0-9]+)*(?:\/[\d]+)?)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(value: number) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function rgbString([r, g, b]: readonly [number, number, number], alpha = 1) {
  return alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mixRgb(
  from: readonly [number, number, number],
  to: readonly [number, number, number],
  amount: number,
) {
  const t = clamp(amount, 0, 1);
  return rgbString([
    Math.round(from[0] + (to[0] - from[0]) * t),
    Math.round(from[1] + (to[1] - from[1]) * t),
    Math.round(from[2] + (to[2] - from[2]) * t),
  ] as [number, number, number]);
}

function tokenizeHeading(children: ReactNode): WordToken[] {
  const tokens: WordToken[] = [];

  function pushWords(text: string) {
    for (const part of text.split(/\s+/)) {
      if (part) tokens.push({ kind: "word", text: part });
    }
  }

  function walk(node: ReactNode) {
    if (node == null || typeof node === "boolean") return;

    if (typeof node === "string" || typeof node === "number") {
      pushWords(String(node));
      return;
    }

    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    if (!isValidElement(node)) return;

    if (node.type === "br") {
      tokens.push({ kind: "break" });
      return;
    }

    if (node.type === Fragment) {
      walk((node.props as { children?: ReactNode }).children);
      return;
    }

    const props = node.props as { children?: ReactNode };
    if (props.children != null) {
      walk(props.children);
    }
  }

  walk(children);
  return tokens;
}

/** 0 → 1 as the user scrolls down through the heading's reveal window */
function headingSequenceProgress(rect: DOMRect, viewportHeight: number, wordCount: number) {
  const startLine = viewportHeight * 0.84;
  const scrollRange = Math.max(viewportHeight * 0.42, rect.height * 1.35, wordCount * 88);
  const traveled = startLine - rect.top;
  return clamp(traveled / scrollRange, 0, 1);
}

function useHeadingScrollProgress(
  ref: RefObject<HTMLElement | null>,
  wordCount: number,
) {
  const progress = useMotionValue(0);

  useEffect(() => {
    const node = ref.current;
    if (!node || wordCount === 0) return;

    let frame = 0;
    let running = false;

    const update = () => {
      progress.set(
        headingSequenceProgress(node.getBoundingClientRect(), window.innerHeight, wordCount),
      );
    };

    const loop = () => {
      update();
      if (running) frame = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!running) {
            running = true;
            loop();
          }
        } else {
          running = false;
          cancelAnimationFrame(frame);
          update();
        }
      },
      { rootMargin: "25% 0px" },
    );

    observer.observe(node);
    update();

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [progress, ref, wordCount]);

  return progress;
}

/** Single traveling highlight — peaks on one word at a time, dims the rest */
function travelingWordIntensity(scrollProgress: number, wordIndex: number, total: number) {
  if (total <= 1) return smoothstep(scrollProgress);

  const spotlight = scrollProgress * (total - 1);
  const dist = Math.abs(spotlight - wordIndex);
  return smoothstep(1 - dist / 0.5);
}

function ScrollFocusWord({
  text,
  index,
  total,
  progress,
  tone,
  reduceMotion,
  isLastInLine,
}: {
  text: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  tone: ScrollFocusTone;
  reduceMotion: boolean | null;
  isLastInLine: boolean;
}) {
  const inactive = INACTIVE_RGB[tone];

  const color = useTransform(progress, (value) => {
    if (reduceMotion) {
      return rgbString(inactive, 0.55);
    }

    const intensity = travelingWordIntensity(value, index, total);
    return mixRgb(inactive, HIGHLIGHT_RGB, intensity);
  });

  return (
    <motion.span
      style={{ color }}
      className={`inline-block transition-none${isLastInLine ? "" : " mr-[0.28em]"}`}
    >
      {text}
    </motion.span>
  );
}

/** Scroll down — a Pacific Teal highlight travels word-by-word across the heading. */
export function ScrollFocusHeading({
  as = "h2",
  children,
  className = "",
  tone = "light",
}: ScrollFocusHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduceMotion = useReducedMotion();
  const Tag = MOTION_TAGS[as];
  const tokens = tokenizeHeading(children);
  const wordCount = tokens.filter((token) => token.kind === "word").length;
  const progress = useHeadingScrollProgress(ref, wordCount);

  const nodes: ReactNode[] = [];
  let lineWords: WordToken[] = [];
  let wordIndex = 0;

  const flushLine = () => {
    lineWords.forEach((token, lineIndex) => {
      if (token.kind !== "word") return;
      const currentIndex = wordIndex;
      wordIndex += 1;
      nodes.push(
        <ScrollFocusWord
          key={`${token.text}-${currentIndex}`}
          text={token.text}
          index={currentIndex}
          total={wordCount}
          progress={progress}
          tone={tone}
          reduceMotion={reduceMotion}
          isLastInLine={lineIndex === lineWords.length - 1}
        />,
      );
    });
    lineWords = [];
  };

  for (const token of tokens) {
    if (token.kind === "break") {
      flushLine();
      nodes.push(<br key={`br-${nodes.length}`} />);
      continue;
    }
    lineWords.push(token);
  }
  flushLine();

  return (
    <Tag ref={ref} className={`transition-none ${stripTextColor(className)}`.trim()}>
      {nodes}
    </Tag>
  );
}
