"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

type InteractivePortraitTileProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Stagger parallax direction/speed across the collage. */
  parallaxIndex?: number;
};

export function InteractivePortraitTile({
  src,
  alt,
  sizes,
  className = "",
  priority = false,
  parallaxIndex = 0,
}: InteractivePortraitTileProps) {
  const tileRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: tileRef,
    offset: ["start 0.9", "end 0.1"],
  });

  const drift = 12 + (parallaxIndex % 4) * 6;
  const tilt = 5 + (parallaxIndex % 3) * 2;
  const yaw = parallaxIndex % 2 === 0 ? 1 : -1;

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.04, 0.94]);
  const y = useTransform(scrollYProgress, [0, 1], [drift, -drift]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [tilt, 0, -tilt]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-2 * yaw, 0, 2 * yaw]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.14, 1.02, 1.1]);

  if (reduceMotion) {
    return (
      <div
        className={`relative h-full w-full overflow-hidden rounded-2xl bg-transparent sm:rounded-3xl ${className}`}
      >
        <div className="relative h-full w-full bg-pure-white">
          <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={tileRef}
      className={`relative h-full w-full overflow-hidden rounded-2xl bg-transparent sm:rounded-3xl ${className}`}
      style={{
        scale,
        y,
        rotateX,
        rotateY,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div className="relative h-full w-full bg-pure-white" style={{ scale: imageScale }}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </motion.div>
    </motion.div>
  );
}
