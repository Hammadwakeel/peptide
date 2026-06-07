"use client";

import { useEffect, useRef } from "react";
import { formatMessageTime, type ChatSender, type ThreadMessage } from "@/lib/chat/types";

type ChatMessageListProps = {
  messages: ThreadMessage[];
  viewerRole: ChatSender;
};

export function ChatMessageList({ messages, viewerRole }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-deep-teal/50">No messages yet. Start the conversation.</p>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto px-4 py-4">
      {messages.map((message) => {
        const isOwn = message.sender === viewerRole;
        return (
          <div
            key={message.id}
            className={`max-w-[85%] sm:max-w-md ${isOwn ? "ml-auto" : "mr-auto"}`}
          >
            <p className={`mb-1 text-[10px] ${isOwn ? "text-right" : "text-left"} text-deep-teal/45`}>
              {message.senderName} · {formatMessageTime(message.sentAt)}
            </p>
            <div
              className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                isOwn
                  ? "bg-deep-teal text-pure-white"
                  : "bg-deep-teal/[0.06] text-deep-teal"
              }`}
            >
              {message.content}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
