"use client";

import { useEffect } from "react";
import { ChatMessageInput } from "@/components/chat/ChatMessageInput";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { useChat } from "@/context/ChatProvider";
import { getPatientInitials } from "@/lib/patients/types";
import type { ChatThread } from "@/lib/chat/types";

type ProviderActiveThreadProps = {
  thread: ChatThread;
  compact?: boolean;
};

export function ProviderActiveThread({ thread, compact = false }: ProviderActiveThreadProps) {
  const { sendMessage, markRead } = useChat();

  useEffect(() => {
    markRead(thread.patientId, "provider");
  }, [thread.patientId, markRead]);

  return (
    <div className={`flex flex-col ${compact ? "h-[480px]" : "h-[calc(100dvh-220px)] min-h-[420px]"}`}>
      <div className="border-b border-deep-teal/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-deep-teal/10 text-sm font-medium text-deep-teal">
            {getPatientInitials(thread.patientName)}
          </span>
          <div>
            <p className="font-medium text-deep-teal">{thread.patientName}</p>
            <p className="text-xs text-deep-teal/50">Patient conversation</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ChatMessageList messages={thread.messages} viewerRole="provider" />
      </div>
      <ChatMessageInput
        onSend={(content) => {
          sendMessage(thread.patientId, "provider", thread.providerName, content);
        }}
      />
    </div>
  );
}
