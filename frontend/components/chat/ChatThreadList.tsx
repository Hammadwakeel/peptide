"use client";

import { TruncateTooltip } from "@/components/ui/Tippy";
import { getPatientInitials } from "@/lib/patients/types";
import { formatThreadPreviewTime, type ChatThread } from "@/lib/chat/types";

type ChatThreadListProps = {
  threads: ChatThread[];
  activePatientId: string | null;
  onSelect: (patientId: string) => void;
};

export function ChatThreadList({ threads, activePatientId, onSelect }: ChatThreadListProps) {
  const sorted = [...threads].sort((a, b) => {
    const aTime = a.messages[a.messages.length - 1]?.sentAt ?? "";
    const bTime = b.messages[b.messages.length - 1]?.sentAt ?? "";
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  return (
    <ul className="divide-y divide-deep-teal/10 overflow-y-auto">
      {sorted.map((thread) => {
        const last = thread.messages[thread.messages.length - 1];
        const active = thread.patientId === activePatientId;
        return (
          <li key={thread.patientId}>
            <button
              type="button"
              onClick={() => onSelect(thread.patientId)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-deep-teal/[0.03] ${
                active ? "bg-deep-teal/[0.05]" : ""
              }`}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-deep-teal/10 text-xs font-medium text-deep-teal">
                {getPatientInitials(thread.patientName)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <TruncateTooltip content={thread.patientName}>
                    <p className="truncate font-medium text-deep-teal">{thread.patientName}</p>
                  </TruncateTooltip>
                  {last ? (
                    <span className="shrink-0 text-[10px] text-deep-teal/45">
                      {formatThreadPreviewTime(last.sentAt)}
                    </span>
                  ) : null}
                </div>
                <TruncateTooltip content={last?.content ?? "No messages yet"}>
                  <p className="mt-0.5 truncate text-xs text-deep-teal/55">
                    {last?.content ?? "No messages yet"}
                  </p>
                </TruncateTooltip>
              </div>
              {thread.unreadProvider > 0 ? (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-pacific-teal text-[10px] font-medium text-pure-white">
                  {thread.unreadProvider}
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
