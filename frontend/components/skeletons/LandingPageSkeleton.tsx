import { Skeleton } from "@/components/ui/Skeleton";

import { landingPillHeightClass, landingTopRailClass, landingTopShellClass } from "@/lib/brand/design-system";

function NavbarSkeleton() {
  return (
    <div className={`${landingTopShellClass} pt-4`}>
      <div className={`${landingTopRailClass} grid grid-cols-[auto_1fr_auto] items-center gap-3`}>
        <Skeleton className="h-7 w-24 rounded-md bg-pure-white/20 sm:h-8" />
        <div className={`hidden w-fit shrink-0 justify-self-center items-center gap-3 rounded-full border border-pure-white/55 bg-pure-white/22 p-1.5 backdrop-blur-[20px] md:inline-flex`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16 rounded-full bg-pure-white/30" />
          ))}
        </div>
        <Skeleton className={`${landingPillHeightClass} w-36 justify-self-end rounded-full border border-pure-white/55 bg-pure-white/22 backdrop-blur-[20px]`} />
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <section className="relative flex min-h-dvh flex-col overflow-hidden bg-deep-teal">
      <NavbarSkeleton />
      <div className={`${landingTopShellClass} flex flex-1 items-center pb-10 pt-4`}>
        <div className={`${landingTopRailClass} w-full`}>
          <div className="w-full rounded-[2.5rem] border border-pure-white/50 bg-pure-white/18 p-8 backdrop-blur-[24px] sm:p-12">
            <div className="mx-auto flex max-w-xl flex-col items-center space-y-6 text-center">
              <Skeleton className="h-20 w-full bg-deep-teal/10" />
              <Skeleton className="h-12 w-full bg-deep-teal/10" />
              <Skeleton className="h-12 w-40 rounded-full border border-deep-teal/15 bg-pure-white/20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionSkeleton({
  centered = false,
  cards = 3,
}: {
  centered?: boolean;
  cards?: number;
}) {
  return (
    <section className="bg-pure-white py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-8 md:px-12 lg:px-20 xl:px-28">
        <div className={centered ? "mb-16 text-center" : "max-w-5xl"}>
          <Skeleton
            className={`h-7 w-40 rounded-full ${centered ? "mx-auto" : ""}`}
          />
          <Skeleton
            className={`mt-6 h-16 w-full max-w-2xl ${centered ? "mx-auto" : ""}`}
          />
          {!centered && <Skeleton className="mt-3 h-16 w-full max-w-xl" />}
        </div>
        <div
          className={`mt-16 grid gap-8 ${
            cards === 4 ? "md:grid-cols-2" : "md:grid-cols-3"
          }`}
        >
          {Array.from({ length: cards }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-[2rem]" />
          ))}
        </div>
      </div>
    </section>
  );
}

function FooterSkeleton() {
  return (
    <footer className="border-t border-deep-teal/10 bg-pure-white">
      <div className="mx-auto max-w-[1400px] px-8 md:px-12 lg:px-20">
        <div className="grid gap-12 border-b border-deep-teal/10 py-16 lg:grid-cols-12 lg:gap-16 lg:py-20">
          <div className="space-y-4 lg:col-span-5">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-20 w-full max-w-sm" />
            <Skeleton className="h-14 w-full max-w-sm" />
          </div>
          <div className="space-y-4 lg:col-span-3">
            <Skeleton className="h-4 w-20" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-24" />
            ))}
          </div>
          <div className="space-y-4 lg:col-span-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-14 w-full max-w-xs" />
            <Skeleton className="h-11 w-36 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </footer>
  );
}

export function LandingPageSkeleton() {
  return (
    <main
      className="bg-pure-white font-sans text-deep-teal"
      aria-busy="true"
      aria-label="Loading landing page"
    >
      <HeroSkeleton />
      <SectionSkeleton />
      <section className="bg-surface-muted py-20 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-8 md:px-12 lg:px-20 xl:px-28">
          <div className="mb-16 text-center">
            <Skeleton className="mx-auto h-4 w-36" />
            <Skeleton className="mx-auto mt-6 h-16 w-full max-w-2xl" />
          </div>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Skeleton className="aspect-[4/5] w-full rounded-[2.5rem]" />
            <div className="grid gap-8 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-[2.5rem]" />
              ))}
            </div>
          </div>
        </div>
      </section>
      <SectionSkeleton cards={4} />
      <SectionSkeleton />
      <section className="bg-pure-white py-32 lg:py-40">
        <div className="mx-auto max-w-[1400px] px-8 text-center md:px-12 lg:px-20">
          <Skeleton className="mx-auto h-4 w-32" />
          <Skeleton className="mx-auto mt-6 h-24 w-full max-w-3xl" />
          <Skeleton className="mx-auto mt-8 h-16 w-full max-w-xl" />
          <Skeleton className="mx-auto mt-12 h-14 w-44 rounded-full" />
        </div>
      </section>
      <FooterSkeleton />
    </main>
  );
}
