"use client";

import Image from "next/image";
import { motion } from "@/components/motion";

const BACKGROUND_IMAGES = {
  hands: "/brand/brand image carrying hands.png",
  "merch-jacket": "/brand/merch-jacket-embroidered-logo.png",
} as const;

type AuthShellProps = {
  children: React.ReactNode;
  background?: keyof typeof BACKGROUND_IMAGES | "video";
  compact?: boolean;
};

export function AuthShell({
  children,
  background = "hands",
  compact = false,
}: AuthShellProps) {
  return (
    <div
      className={`flex flex-col bg-pure-white lg:flex-row ${compact ? "lg:h-dvh" : "min-h-dvh"}`}
    >
      <div className="relative hidden w-full shrink-0 lg:block lg:h-dvh lg:w-1/2">
        {background === "video" ? (
          <video
            src="/brand/A_cinematic_slow_motion_macro.mp4"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : (
          <Image
            src={BACKGROUND_IMAGES[background]}
            alt=""
            fill
            priority
            aria-hidden="true"
            className="object-cover object-center"
            sizes="50vw"
          />
        )}
      </div>

      <motion.div
        className={
          compact
            ? "relative flex w-full flex-col bg-pure-white px-4 py-5 sm:px-5 lg:h-dvh lg:w-1/2 lg:justify-center lg:px-8 lg:py-6 xl:px-10"
            : "relative flex w-full flex-col bg-pure-white px-4 py-8 sm:px-6 sm:py-10 lg:min-h-dvh lg:w-1/2 lg:px-12 xl:px-16"
        }
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className={
            compact
              ? "w-full max-w-2xl lg:mx-auto"
              : "flex flex-1 flex-col items-center justify-center"
          }
        >
          <div className={compact ? "w-full" : "w-full max-w-xl"}>{children}</div>
        </div>
      </motion.div>
    </div>
  );
}

export function AuthCard({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "rounded-2xl border border-deep-teal/10 bg-pure-white p-4 shadow-xl shadow-deep-teal/5 sm:rounded-[1.5rem] sm:p-5"
          : "rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-xl shadow-deep-teal/5 sm:rounded-[2rem] sm:p-8 md:p-10"
      }
    >
      {children}
    </div>
  );
}

export const authInputClassName =
  "w-full rounded-xl border border-deep-teal/15 bg-pure-white px-4 py-3 text-deep-teal outline-none transition-colors placeholder:text-deep-teal/35 focus:border-pacific-teal focus:ring-2 focus:ring-pacific-teal/20";

export const authInputCompactClassName =
  "w-full rounded-lg border border-deep-teal/15 bg-pure-white px-3 py-2 text-sm text-deep-teal outline-none transition-colors placeholder:text-deep-teal/35 focus:border-pacific-teal focus:ring-2 focus:ring-pacific-teal/20";

export const authLabelClassName = "mb-2 block text-sm font-medium text-deep-teal";

export const authLabelCompactClassName =
  "mb-1 block text-xs font-medium text-deep-teal";

export const authLinkClassName =
  "font-medium text-pacific-teal transition-colors hover:text-deep-teal hover:underline";
