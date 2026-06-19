import { LOGO_ASSETS } from "@/lib/brand/logos";

export const LANDING_HERO_VIDEO = "/assets/herosection/herosection.webm";

export const LANDING_PARTNER_ACCESS_VIDEO =
  "/assets/partneraccess/Make_a_video_with_the_exact_de.mp4";

/** Critical landing media — preloaded before the site is revealed. */
export const LANDING_PRELOAD_IMAGES = [
  LOGO_ASSETS.black,
  LOGO_ASSETS.white,
  "/brand/campaign-supply-layer-banner.png",
  "/brand/product-vial-2x-blend-hero.png",
  "/brand/merch-tote-built-for-whats-next.png",
  "/brand/product-mobile-dashboard.png",
  "/brand/humanised-man-blue-sky-portrait.png",
  "/brand/humanised-woman-phone-lifestyle.png",
  "/brand/humanised-woman-gold-glitter.png",
  "/brand/humanised-man-laughing-portrait.png",
  "/brand/humanised-woman-serene-clouds.png",
  "/brand/humanised-woman-braids-laughing.png",
] as const;

/** Hard cap so a failed asset never blocks the site indefinitely. */
export const LANDING_PRELOAD_TIMEOUT_MS = 12_000;

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
}

function preloadVideo(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;

    const cleanup = () => {
      video.removeEventListener("canplaythrough", onReady);
      video.removeEventListener("error", onError);
    };

    const onReady = () => {
      cleanup();
      resolve();
    };

    const onError = () => {
      cleanup();
      reject(new Error(`Failed to preload video: ${src}`));
    };

    video.addEventListener("canplaythrough", onReady);
    video.addEventListener("error", onError);
    video.src = src;
    video.load();
  });
}

export async function preloadLandingAssets(): Promise<void> {
  const tasks = [
    preloadVideo(LANDING_HERO_VIDEO),
    ...LANDING_PRELOAD_IMAGES.map((src) => preloadImage(src)),
  ];

  await Promise.allSettled(tasks);
}
