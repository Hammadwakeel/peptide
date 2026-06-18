import { Skeleton } from "@/components/ui/Skeleton";

export function ChatThreadListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <ul className="overflow-y-auto" aria-busy="true" aria-label="Loading conversations">
      {Array.from({ length: rows }).map((_, index) => (
        <li key={index} className="flex items-center gap-3 border-b border-deep-teal/6 px-4 py-3">
          <Skeleton className="size-12 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex justify-between gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-3 w-full max-w-[200px]" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ChatMessageListSkeleton() {
  return (
    <div
      className="flex h-full flex-col justify-end gap-3 overflow-hidden bg-coral-blush/40 px-4 py-4"
      aria-busy="true"
      aria-label="Loading messages"
    >
      <div className="flex justify-center">
        <Skeleton className="h-6 w-20 rounded-lg" />
      </div>
      <div className="mr-auto max-w-[72%] space-y-2">
        <Skeleton className="h-16 w-52 rounded-2xl rounded-tl-sm" />
      </div>
      <div className="ml-auto max-w-[72%] space-y-2">
        <Skeleton className="ml-auto h-12 w-44 rounded-2xl rounded-tr-sm" />
        <Skeleton className="ml-auto h-20 w-56 rounded-2xl rounded-tr-sm" />
      </div>
      <div className="mr-auto max-w-[72%]">
        <Skeleton className="h-14 w-48 rounded-2xl rounded-tl-sm" />
      </div>
      <div className="ml-auto max-w-[72%]">
        <Skeleton className="ml-auto h-10 w-36 rounded-2xl rounded-tr-sm" />
      </div>
    </div>
  );
}

export function ChatPatientShellSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-72px)] min-h-[520px] overflow-hidden rounded-2xl border border-deep-teal/10 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.08)]">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-deep-teal/10 bg-surface-muted/30 px-4 py-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-deep-teal/8 px-3 py-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-24 rounded-full" />
          ))}
        </div>
        <div className="min-h-0 flex-1">
          <ChatMessageListSkeleton />
        </div>
        <div className="border-t border-deep-teal/10 px-3 py-3">
          <Skeleton className="h-11 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProviderChatPageSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-72px)] min-h-[520px] overflow-hidden rounded-2xl border border-deep-teal/10 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.08)]">
      <aside className="hidden w-[360px] shrink-0 flex-col border-r border-deep-teal/10 lg:flex">
        <div className="border-b border-deep-teal/10 bg-surface-muted/40 px-4 py-3.5">
          <Skeleton className="h-6 w-16" />
        </div>
        <ChatThreadListSkeleton />
      </aside>
      <main className="hidden min-w-0 flex-1 flex-col lg:flex">
        <div className="flex items-center gap-3 border-b border-deep-teal/10 px-4 py-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <ChatMessageListSkeleton />
        </div>
        <div className="border-t border-deep-teal/10 px-3 py-3">
          <Skeleton className="h-11 w-full rounded-full" />
        </div>
      </main>
    </div>
  );
}

type ChatProfileTab = "media" | "audio" | "docs";

export function ChatProfileSidebarSkeleton({ tab = "media" }: { tab?: ChatProfileTab }) {
  if (tab === "audio") {
    return (
      <ul className="space-y-2" aria-busy="true" aria-label="Loading voice messages">
        {Array.from({ length: 4 }).map((_, index) => (
          <li key={index} className="rounded-xl border border-deep-teal/10 bg-surface-muted/20 px-3 py-2.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-10 w-full rounded-full" />
          </li>
        ))}
      </ul>
    );
  }

  if (tab === "docs") {
    return (
      <ul className="space-y-2" aria-busy="true" aria-label="Loading documents">
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index} className="flex items-center gap-3 rounded-xl border border-deep-teal/10 bg-surface-muted/20 p-3">
            <Skeleton className="size-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="size-9 shrink-0 rounded-full" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      className="grid grid-cols-3 gap-1 sm:grid-cols-3"
      aria-busy="true"
      aria-label="Loading shared media"
    >
      {Array.from({ length: 9 }).map((_, index) => (
        <Skeleton key={index} className="aspect-square rounded-lg" />
      ))}
    </div>
  );
}
