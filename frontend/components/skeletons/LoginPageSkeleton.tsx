import { Skeleton } from "@/components/ui/Skeleton";

export function LoginPageSkeleton() {
  return (
    <div
      className="flex min-h-dvh bg-pure-white lg:flex-row"
      aria-busy="true"
      aria-label="Loading sign in page"
    >
      <Skeleton className="hidden h-full min-h-dvh w-1/2 rounded-none lg:block" />

      <div className="flex w-full flex-col px-6 py-8 lg:w-1/2 lg:px-12 xl:px-16">
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="w-full max-w-xl rounded-[2rem] border border-deep-teal/10 bg-pure-white p-8 md:p-10">
            <div className="mb-8 space-y-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-4 w-full max-w-sm" />
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-10" />
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-xl" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-2 h-12 w-full rounded-full" />
            </div>

            <Skeleton className="mx-auto mt-6 h-4 w-56" />
            <Skeleton className="mx-auto mt-4 h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
