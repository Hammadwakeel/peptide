import { Skeleton } from "@/components/ui/Skeleton";

function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-deep-teal/5 bg-pure-white/70 backdrop-blur-lg">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-2.5 w-14" />
          </div>
        </div>
        <div className="hidden items-center gap-6 md:flex">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
        <Skeleton className="h-11 w-32 rounded-full" />
      </div>
    </header>
  );
}

function HeroSkeleton() {
  return (
    <section className="flex min-h-[calc(100vh-80px)] items-start bg-pure-white pb-8 pt-0">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="grid w-full items-center gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-6">
            <Skeleton className="min-h-[320px] rounded-[2rem] lg:min-h-[380px]" />
            <Skeleton className="h-24 rounded-[2rem]" />
          </div>
          <div className="flex justify-center lg:col-span-6">
            <Skeleton className="h-[600px] w-full max-w-[400px] rounded-[2rem]" />
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
      <NavbarSkeleton />
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
