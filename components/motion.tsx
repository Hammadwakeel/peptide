"use client";

import {
  motion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";

export const easeOut = [0.22, 1, 0.36, 1] as const;

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -36 },
  visible: { opacity: 1, x: 0 },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 36 },
  visible: { opacity: 1, x: 0 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

export const viewport = { once: true, margin: "-80px" as const };

export const transition = { duration: 0.65, ease: easeOut };

export function MotionSection({
  children,
  className,
  ...props
}: HTMLMotionProps<"section">) {
  return (
    <motion.section
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeIn}
      transition={transition}
      {...props}
    >
      {children}
    </motion.section>
  );
}

export { motion };
