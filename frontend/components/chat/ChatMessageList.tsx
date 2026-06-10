"use client";

import { Download, FileText, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { VoiceMessageBubble } from "@/components/chat/VoiceMessageBubble";
import {
  formatMessageTime,
  type ChatSender,
  type ThreadMessage,
} from "@/lib/chat/types";

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
              className={`overflow-hidden rounded-2xl text-sm leading-relaxed ${
                message.messageType === "image" && message.mediaUrl
                  ? "bg-transparent p-0"
                  : `px-4 py-3 ${
                      isOwn
                        ? "bg-deep-teal text-pure-white"
                        : "bg-deep-teal/[0.06] text-deep-teal"
                    }`
              } ${message.pending ? "opacity-75" : ""}`}
            >
              {message.messageType === "image" ? (
                <div className="overflow-hidden rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
                  {message.mediaUrl ? (
                    <img
                      src={message.mediaUrl}
                      alt={message.content || "Shared image"}
                      className="max-h-72 w-full cursor-pointer object-cover"
                      onClick={() => window.open(message.mediaUrl!, "_blank", "noopener,noreferrer")}
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-deep-teal/[0.03] text-deep-teal/45">
                      <Loader2 className="size-6 animate-spin" />
                    </div>
                  )}
                  {message.content && message.content !== "Image" ? (
                    <p className="px-3 py-2 text-sm text-deep-teal">{message.content}</p>
                  ) : null}
                </div>
              ) : null}

              {message.messageType === "document" && message.mediaUrl ? (
                <a
                  href={message.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-opacity hover:opacity-90 ${
                    isOwn ? "border-pure-white/20 bg-pure-white/10" : "border-deep-teal/10 bg-pure-white"
                  }`}
                >
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                      isOwn ? "bg-pure-white/15 text-pure-white" : "bg-deep-teal/10 text-deep-teal"
                    }`}
                  >
                    <FileText className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{message.content || "Document"}</span>
                    <span className={`text-xs ${isOwn ? "text-pure-white/70" : "text-deep-teal/50"}`}>
                      Tap to open
                    </span>
                  </span>
                  <Download className={`size-4 shrink-0 ${isOwn ? "text-pure-white/80" : "text-deep-teal/50"}`} />
                </a>
              ) : null}

              {message.messageType === "voice" && message.mediaUrl ? (
                <VoiceMessageBubble
                  mediaUrl={message.mediaUrl}
                  durationMs={message.mediaDurationMs}
                  messageId={message.id}
                  isOwn={isOwn}
                />
              ) : null}

              {message.messageType === "text" ? <p>{message.content}</p> : null}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
