"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SiteLoader } from "@/components/SiteLoader";
import { easeOut } from "@/components/motion";
import { useLandingPreload } from "@/lib/hooks/use-landing-preload";

type LandingPageGateProps = {
  children: ReactNode;
};

export function LandingPageGate({ children }: LandingPageGateProps) {
  const isReady = useLandingPreload();

  return (
    <>
      <motion.div
        initial={false}
        animate={{ opacity: isReady ? 1 : 0 }}
        transition={{ duration: 0.55, ease: easeOut }}
        className={!isReady ? "pointer-events-none" : undefined}
        aria-hidden={!isReady}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {!isReady ? (
          <motion.div
            key="site-loader"
            className="fixed inset-0 z-[100]"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: easeOut }}
          >
            <SiteLoader />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
