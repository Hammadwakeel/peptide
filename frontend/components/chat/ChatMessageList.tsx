"use client";

import { useEffect, useMemo, useRef } from "react";
import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";
import { groupMessagesByDate, type ChatSender, type ThreadMessage } from "@/lib/chat/types";

type ChatMessageListProps = {
  messages: ThreadMessage[];
  viewerRole: ChatSender;
  onReply?: (message: ThreadMessage) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
};

function ChatDateSeparator({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-2">
      <span className="rounded-lg bg-deep-teal/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-deep-teal/60 shadow-sm">
        {label}
      </span>
    </div>
  );
}

export function ChatMessageList({
  messages,
  viewerRole,
  onReply,
  onToggleReaction,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageById = useMemo(
    () => new Map(messages.map((message) => [message.id, message])),
    [messages],
  );
  const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#efeae2]/40 px-6 text-center">
        <p className="rounded-xl bg-pure-white/80 px-4 py-2 text-sm text-deep-teal/55 shadow-sm">
          No messages yet. Start the conversation.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex h-full flex-col overflow-y-auto bg-[#efeae2]/40 px-3 py-3 sm:px-4"
    >
      <div className="mt-auto flex flex-col gap-1">
        {groupedMessages.map((group) => (
          <div key={group.dateKey}>
            <ChatDateSeparator label={group.label} />
            <div className="flex flex-col gap-0.5">
              {group.messages.map((message) => {
                const isOwn = message.sender === viewerRole;
                const replyToMessage = message.replyToMessageId
                  ? messageById.get(message.replyToMessageId)
                  : undefined;

                return (
                  <ChatMessageBubble
                    key={message.id}
                    message={message}
                    isOwn={isOwn}
                    replyToMessage={replyToMessage}
                    onReply={onReply}
                    onToggleReaction={onToggleReaction}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
