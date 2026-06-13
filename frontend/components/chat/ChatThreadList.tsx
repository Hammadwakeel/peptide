"use client";

import { TruncateTooltip } from "@/components/ui/Tippy";
import { getPatientInitials } from "@/lib/patients/types";
import {
  formatThreadPreviewTime,
  getThreadLastActivityAt,
  getThreadPreviewText,
  type ChatSender,
  type ChatThread,
} from "@/lib/chat/types";

type ChatThreadListProps = {
  threads: ChatThread[];
  activePatientId: string | null;
  onSelect: (patientId: string) => void;
  viewerRole?: ChatSender;
};

export function ChatThreadList({
  threads,
  activePatientId,
  onSelect,
  viewerRole = "provider",
}: ChatThreadListProps) {
  const sorted = [...threads].sort((a, b) => {
    const aTime = getThreadLastActivityAt(a);
    const bTime = getThreadLastActivityAt(b);
    if (!aTime && !bTime) return 0;
    if (!aTime) return 1;
    if (!bTime) return -1;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  return (
    <ul className="overflow-y-auto">
      {sorted.map((thread) => {
        const active = thread.patientId === activePatientId;
        const preview = getThreadPreviewText(thread, viewerRole);
        const lastActivityAt = getThreadLastActivityAt(thread);
        const unread = viewerRole === "provider" ? thread.unreadProvider : thread.unreadPatient;

        return (
          <li key={thread.patientId}>
            <button
              type="button"
              onClick={() => onSelect(thread.patientId)}
              className={`flex w-full items-center gap-3 border-b border-deep-teal/6 px-4 py-3 text-left transition-colors hover:bg-deep-teal/[0.04] ${
                active ? "bg-deep-teal/[0.07]" : "bg-pure-white"
              }`}
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-pacific-teal/15 text-sm font-light text-deep-teal">
                {getPatientInitials(thread.patientName)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <TruncateTooltip content={thread.patientName}>
                    <p className="truncate font-light text-deep-teal">{thread.patientName}</p>
                  </TruncateTooltip>
                  {lastActivityAt ? (
                    <span
                      className={`shrink-0 text-[11px] tabular-nums ${
                        unread > 0 ? "font-light text-pacific-teal" : "text-deep-teal/45"
                      }`}
                    >
                      {formatThreadPreviewTime(lastActivityAt)}
                    </span>
                  ) : null}
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <TruncateTooltip content={preview}>
                    <p className="truncate text-sm text-deep-teal/55">{preview}</p>
                  </TruncateTooltip>
                  {unread > 0 ? (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-pacific-teal text-[10px] font-light text-pure-white">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
