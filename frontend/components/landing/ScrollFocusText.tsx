"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ScrollFocusTextProps = {
  as?: "h1" | "h2" | "h3" | "p" | "span";
  children: ReactNode;
  className?: string;
};

/** Teal → deep black typography as the block enters the viewport focus zone */
export function ScrollFocusText({ as = "span", children, className = "" }: ScrollFocusTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const Tag = as;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFocused(entry.isIntersecting && entry.intersectionRatio >= 0.45),
      { threshold: [0.15, 0.45, 0.75] },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <Tag
        className={`transition-[color] duration-700 ease-out ${
          focused ? "text-deep-teal" : "text-pacific-teal"
        } ${className}`}
      >
        {children}
      </Tag>
    </div>
  );
}
