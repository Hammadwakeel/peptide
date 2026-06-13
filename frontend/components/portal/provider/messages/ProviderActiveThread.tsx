"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { ChatMessageInput, toReplyTarget } from "@/components/chat/ChatMessageInput";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { useChat } from "@/context/ChatProvider";
import { getPatientInitials } from "@/lib/patients/types";
import type { ChatThread, ReplyTarget, ThreadMessage } from "@/lib/chat/types";

type ProviderActiveThreadProps = {
  thread: ChatThread;
  compact?: boolean;
  onBack?: () => void;
};

export function ProviderActiveThread({ thread, compact = false, onBack }: ProviderActiveThreadProps) {
  const { sendMessage, sendMedia, markRead, loadMessages, toggleReaction } = useChat();
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);

  useEffect(() => {
    void loadMessages(thread.conversationId);
    void markRead(thread.conversationId, "provider");
  }, [thread.conversationId, loadMessages, markRead]);

  function handleReply(message: ThreadMessage) {
    setReplyTo(toReplyTarget(message));
  }

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${compact ? "h-[480px]" : ""}`}>
      <div className="flex items-center gap-3 border-b border-deep-teal/10 bg-surface-muted/30 px-3 py-2.5 sm:px-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-deep-teal hover:bg-deep-teal/8 lg:hidden"
            aria-label="Back to chats"
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : null}
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-pacific-teal/15 text-sm font-light text-deep-teal">
          {getPatientInitials(thread.patientName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-light text-deep-teal">{thread.patientName}</p>
          <p className="text-xs text-deep-teal/50">Patient</p>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <ChatMessageList
          messages={thread.messages}
          viewerRole="provider"
          onReply={handleReply}
          onToggleReaction={(messageId, emoji) =>
            void toggleReaction(thread.conversationId, messageId, emoji)
          }
        />
      </div>

      <ChatMessageInput
        replyTo={replyTo}
        onReplyChange={setReplyTo}
        onSend={(content, options) => sendMessage(thread.conversationId, content, options)}
        onUpload={(file, messageType, options) =>
          sendMedia(thread.conversationId, file, messageType, options)
        }
      />
    </div>
  );
}
