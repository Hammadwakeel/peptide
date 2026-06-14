"use client";

import {
  CornerUpLeft,
  Download,
  FileText,
  Loader2,
  ScanLine,
} from "lucide-react";
import { useMemo } from "react";
import { ChatReactionBar } from "@/components/chat/ChatEmojiPicker";
import { VoiceMessageBubble } from "@/components/chat/VoiceMessageBubble";
import { Tooltip } from "@/components/ui/Tippy";
import {
  getClinicalMediaLabel,
  mediaDownloadFilename,
  replyPreviewText,
  triggerMediaDownload,
} from "@/lib/chat/media-utils";
import { formatBubbleTime, type ThreadMessage } from "@/lib/chat/types";
import { readSession } from "@/lib/auth/storage";

type ChatMessageBubbleProps = {
  message: ThreadMessage;
  isOwn: boolean;
  replyToMessage?: ThreadMessage;
  onReply?: (message: ThreadMessage) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
};

function groupReactions(reactions: ThreadMessage["reactions"]) {
  const groups = new Map<string, number>();
  for (const reaction of reactions ?? []) {
    groups.set(reaction.emoji, (groups.get(reaction.emoji) ?? 0) + 1);
  }
  return Array.from(groups.entries());
}

export function ChatMessageBubble({
  message,
  isOwn,
  replyToMessage,
  onReply,
  onToggleReaction,
}: ChatMessageBubbleProps) {
  const sessionUserId = readSession()?.userId;
  const reactionGroups = useMemo(() => groupReactions(message.reactions), [message.reactions]);
  const myReaction = message.reactions?.find((reaction) => reaction.user_id === sessionUserId)?.emoji;

  const clinicalLabel =
    message.messageType === "image" || message.messageType === "document"
      ? getClinicalMediaLabel(message.messageType, message.content, message.mediaMime)
      : null;

  const bubbleShellClass = isOwn
    ? "bg-pacific-teal text-pure-white shadow-sm"
    : "border border-deep-teal/8 bg-pure-white text-deep-teal shadow-sm";

  const bubbleRadiusClass = isOwn
    ? "rounded-lg rounded-br-sm"
    : "rounded-lg rounded-bl-sm";

  function handleDownload() {
    if (!message.mediaUrl) return;
    triggerMediaDownload(
      message.mediaUrl,
      mediaDownloadFilename(message.messageType, message.content, message.mediaMime),
    );
  }

  return (
    <div
      className={`group/message flex w-full py-0.5 ${isOwn ? "justify-end" : "justify-start"}`}
      data-message-id={message.id}
    >
      <div className="flex max-w-[min(78%,22rem)] flex-col items-stretch gap-1">

        <div className={`relative w-fit max-w-full ${isOwn ? "self-end" : "self-start"}`}>
          {onToggleReaction ? (
            <div
              className={`absolute -top-12 z-20 hidden group-hover/message:flex group-focus-within/message:flex ${
                isOwn ? "right-0" : "left-0"
              }`}
            >
              <ChatReactionBar
                onPick={(emoji) => onToggleReaction(message.id, emoji)}
                className={isOwn ? "items-end" : "items-start"}
              />
            </div>
          ) : null}

          <div className="absolute -top-2 right-0 z-10 hidden gap-1 group-hover/message:flex group-focus-within/message:flex">
            {onReply ? (
              <Tooltip content="Reply">
                <button
                  type="button"
                  onClick={() => onReply(message)}
                  className="flex size-7 items-center justify-center rounded-full border border-deep-teal/10 bg-pure-white text-deep-teal shadow-sm hover:bg-deep-teal/5"
                  aria-label="Reply to message"
                >
                  <CornerUpLeft className="size-3.5" />
                </button>
              </Tooltip>
            ) : null}
          </div>

          <div
            className={`w-fit max-w-full overflow-hidden text-sm leading-relaxed ${bubbleRadiusClass} ${
              message.messageType === "image" && message.mediaUrl
                ? "bg-transparent p-0 shadow-none"
                : `px-2.5 py-1.5 ${bubbleShellClass}`
            } ${message.pending ? "opacity-75" : ""}`}
          >
            {replyToMessage ? (
              <div
                className={`mb-2 rounded-lg border-l-2 px-2.5 py-1.5 text-xs ${
                  isOwn
                    ? "border-pure-white/50 bg-pure-white/10 text-pure-white/85"
                    : "border-pacific-teal bg-pure-white/70 text-deep-teal/70"
                }`}
              >
                <p className="font-light">{replyToMessage.senderName}</p>
                <p className="mt-0.5 line-clamp-2">{replyPreviewText(replyToMessage)}</p>
              </div>
            ) : null}

            {message.messageType === "image" ? (
              <div className="overflow-hidden rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
                {clinicalLabel ? (
                  <div className="flex items-center gap-1.5 border-b border-deep-teal/8 bg-surface-muted/60 px-3 py-1.5 text-[10px] font-light uppercase tracking-wide text-pacific-teal">
                    <ScanLine className="size-3" aria-hidden="true" />
                    {clinicalLabel}
                  </div>
                ) : null}
                {message.mediaUrl ? (
                  <div className="relative">
                    <img
                      src={message.mediaUrl}
                      alt={message.content || "Shared image"}
                      className="max-h-80 max-w-full object-contain bg-deep-teal/[0.02]"
                    />
                    {!isOwn ? (
                      <div className="absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-deep-teal/55 to-transparent p-2">
                        <button
                          type="button"
                          onClick={handleDownload}
                          className="inline-flex items-center gap-1.5 rounded-full bg-pure-white/95 px-3 py-1.5 text-xs font-light text-deep-teal shadow-sm transition-opacity hover:opacity-90"
                          aria-label={`Download ${message.content || "image"}`}
                        >
                          <Download className="size-3.5" aria-hidden="true" />
                          Download
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex h-40 w-48 items-center justify-center bg-deep-teal/[0.03] text-deep-teal/45">
                    <Loader2 className="size-6 animate-spin" />
                  </div>
                )}
                {message.content && message.content !== "Image" ? (
                  <p className="px-3 py-2 text-sm text-deep-teal">{message.content}</p>
                ) : null}
                <div className="flex items-center justify-end px-3 pb-2 pt-1">
                  <time
                    dateTime={message.sentAt}
                    className="text-[10px] tabular-nums text-deep-teal/45"
                  >
                    {formatBubbleTime(message.sentAt)}
                  </time>
                </div>
              </div>
            ) : null}

            {message.messageType === "document" && message.mediaUrl ? (
              <div className="min-w-[12rem]">
                {clinicalLabel ? (
                  <p className="mb-2 flex items-center gap-1.5 text-[10px] font-light uppercase tracking-wide text-pacific-teal">
                    <ScanLine className="size-3" aria-hidden="true" />
                    {clinicalLabel}
                  </p>
                ) : null}
                <div
                  className={`flex items-center gap-3 rounded-xl border p-3 ${
                    isOwn ? "border-pure-white/20 bg-pure-white/10" : "border-deep-teal/10 bg-pure-white"
                  }`}
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                      isOwn ? "bg-pure-white/15 text-pure-white" : "bg-deep-teal/10 text-deep-teal"
                    }`}
                  >
                    <FileText className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-light">{message.content || "Document"}</span>
                    <span className={`text-xs ${isOwn ? "text-pure-white/70" : "text-deep-teal/50"}`}>
                      Report / document
                    </span>
                  </span>
                  <Tooltip content="Download file">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                        isOwn
                          ? "bg-pure-white/15 text-pure-white hover:bg-pure-white/25"
                          : "bg-deep-teal/8 text-deep-teal hover:bg-deep-teal/12"
                      }`}
                      aria-label={`Download ${message.content || "document"}`}
                    >
                      <Download className="size-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            ) : null}

            {message.messageType === "voice" && message.mediaUrl ? (
              <VoiceMessageBubble
                mediaUrl={message.mediaUrl}
                durationMs={message.mediaDurationMs}
                messageId={message.id}
                isOwn={isOwn}
              />
            ) : null}

            {message.messageType === "text" ? (
              <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                {message.content}
                <span
                  className={`ml-2 inline-block translate-y-0.5 whitespace-nowrap align-bottom text-[10px] tabular-nums ${
                    isOwn ? "text-pure-white/75" : "text-deep-teal/45"
                  }`}
                >
                  {formatBubbleTime(message.sentAt)}
                  {message.pending ? " ·" : null}
                </span>
              </p>
            ) : null}

            {message.messageType !== "image" && message.messageType !== "text" ? (
              <div
                className={`mt-1.5 flex items-center gap-2 ${
                  isOwn ? "justify-end text-pure-white/65" : "justify-end text-deep-teal/45"
                }`}
              >
                {message.pending ? (
                  <Loader2 className={`size-3 animate-spin ${isOwn ? "text-pure-white/65" : "text-deep-teal/45"}`} />
                ) : null}
                <time dateTime={message.sentAt} className="text-[10px] tabular-nums">
                  {formatBubbleTime(message.sentAt)}
                </time>
              </div>
            ) : null}
          </div>
        </div>

        {reactionGroups.length > 0 ? (
          <div className={`flex flex-wrap gap-1 ${isOwn ? "justify-end" : "justify-start"}`}>
            {reactionGroups.map(([emoji, count]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onToggleReaction?.(message.id, emoji)}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
                  myReaction === emoji
                    ? "border-pacific-teal/40 bg-pacific-teal/10 text-deep-teal"
                    : "border-deep-teal/10 bg-pure-white text-deep-teal/70 hover:bg-deep-teal/5"
                }`}
                aria-label={`${count} reaction${count === 1 ? "" : "s"} with ${emoji}`}
              >
                <span>{emoji}</span>
                <span className="font-mono text-[10px]">{count}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
