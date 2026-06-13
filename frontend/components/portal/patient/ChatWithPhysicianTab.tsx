"use client";

import { useEffect, useState } from "react";
import { ChatMessageInput, toReplyTarget } from "@/components/chat/ChatMessageInput";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { useChat } from "@/context/ChatProvider";
import { PATIENT_QUICK_TEMPLATES, type ReplyTarget, type ThreadMessage } from "@/lib/chat/types";

function OnlineIndicator({ online }: { online: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-deep-teal/55">
      <span
        className={`size-2 rounded-full ${online ? "bg-pacific-teal" : "bg-deep-teal/25"}`}
        aria-hidden="true"
      />
      {online ? "Online" : "Offline"}
    </span>
  );
}

export function ChatWithPhysicianTab() {
  const { threads, loading, error, sendMessage, sendMedia, markRead, loadMessages, toggleReaction } =
    useChat();
  const thread = threads[0];
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);

  useEffect(() => {
    if (thread) {
      void loadMessages(thread.conversationId);
      void markRead(thread.conversationId, "patient");
    }
  }, [thread?.conversationId, loadMessages, markRead]);

  if (loading) {
    return <p className="py-12 text-center text-sm text-deep-teal/50">Loading chat…</p>;
  }

  if (error) {
    return <p className="text-sm text-coral-blush">{error}</p>;
  }

  if (!thread) {
    return <p className="text-sm text-deep-teal/50">Unable to load chat.</p>;
  }

  return (
    <div className="flex h-[calc(100dvh-72px)] min-h-[520px] overflow-hidden rounded-2xl border border-deep-teal/10 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.08)]">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-deep-teal/10 bg-surface-muted/30 px-4 py-3">
          <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-pacific-teal/15 text-sm font-semibold text-deep-teal">
            DR
            <span
              className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-pure-white ${
                thread.providerOnline ? "bg-pacific-teal" : "bg-deep-teal/25"
              }`}
              aria-hidden="true"
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-deep-teal">{thread.providerName}</p>
            <OnlineIndicator online={thread.providerOnline} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-deep-teal/8 bg-pure-white px-3 py-2">
          {PATIENT_QUICK_TEMPLATES.map((template) => (
            <button
              key={template}
              type="button"
              onClick={() => setDraft(template)}
              className="rounded-full border border-deep-teal/15 px-3 py-1 text-xs text-deep-teal/70 hover:border-pacific-teal hover:text-deep-teal"
            >
              {template}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1">
          <ChatMessageList
            messages={thread.messages}
            viewerRole="patient"
            onReply={(message: ThreadMessage) => setReplyTo(toReplyTarget(message))}
            onToggleReaction={(messageId, emoji) =>
              void toggleReaction(thread.conversationId, messageId, emoji)
            }
          />
        </div>

        <ChatMessageInput
          draft={draft}
          onDraftChange={setDraft}
          replyTo={replyTo}
          onReplyChange={setReplyTo}
          onSend={(content, options) => sendMessage(thread.conversationId, content, options)}
          onUpload={(file, messageType, options) =>
            sendMedia(thread.conversationId, file, messageType, options)
          }
        />
      </div>
    </div>
  );
}
