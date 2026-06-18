import Image from "next/image";
import { LOADER_ASSET, LOADER_DIMENSIONS } from "@/lib/brand/loader";

export function SiteLoader() {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-deep-teal"
      role="status"
      aria-live="polite"
      aria-label="Loading Frontier Biomed"
    >
      <Image
        src={LOADER_ASSET}
        alt=""
        width={LOADER_DIMENSIONS.width}
        height={LOADER_DIMENSIONS.height}
        priority
        className="h-auto w-[min(280px,70vw)] animate-pulse motion-reduce:animate-none"
      />
    </div>
  );
}
