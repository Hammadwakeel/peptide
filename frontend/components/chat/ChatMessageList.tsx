"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";
import { ChatMessageListSkeleton } from "@/components/chat/ChatSkeletons";
import { CHAT_LOAD_MORE_SCROLL_THRESHOLD } from "@/lib/chat/constants";
import { groupMessagesByDate, type ChatSender, type ThreadMessage } from "@/lib/chat/types";

type ChatMessageListProps = {
  messages: ThreadMessage[];
  viewerRole: ChatSender;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onReply?: (message: ThreadMessage) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
};

function ChatDateSeparator({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-2">
      <span className="rounded-lg bg-deep-teal/10 px-3 py-1 text-[11px] font-light uppercase tracking-wide text-deep-teal/60 shadow-sm">
        {label}
      </span>
    </div>
  );
}

export function ChatMessageList({
  messages,
  viewerRole,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  onReply,
  onToggleReaction,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);
  const prevScrollHeightRef = useRef(0);
  const prevScrollTopRef = useRef(0);
  const loadMoreLockRef = useRef(false);

  const messageById = useMemo(
    () => new Map(messages.map((message) => [message.id, message])),
    [messages],
  );
  const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages]);

  useEffect(() => {
    loadMoreLockRef.current = loadingMore;
  }, [loadingMore]);

  useEffect(() => {
    if (!loadingMore) {
      loadMoreLockRef.current = false;
    }
  }, [loadingMore]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || loading) return;

    const previousCount = prevMessageCountRef.current;
    const currentCount = messages.length;
    const addedCount = currentCount - previousCount;

    if (addedCount > 0 && previousCount > 0 && !isNearBottomRef.current) {
      el.scrollTop = prevScrollTopRef.current + (el.scrollHeight - prevScrollHeightRef.current);
    } else if (previousCount === 0 || isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: previousCount === 0 ? "auto" : "smooth" });
    }

    prevMessageCountRef.current = currentCount;
    prevScrollHeightRef.current = el.scrollHeight;
    prevScrollTopRef.current = el.scrollTop;
  }, [messages, loading]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceFromBottom < 80;

    if (
      el.scrollTop <= CHAT_LOAD_MORE_SCROLL_THRESHOLD &&
      hasMore &&
      onLoadMore &&
      !loadMoreLockRef.current
    ) {
      loadMoreLockRef.current = true;
      prevScrollHeightRef.current = el.scrollHeight;
      prevScrollTopRef.current = el.scrollTop;
      onLoadMore();
    }
  }

  if (loading && messages.length === 0) {
    return <ChatMessageListSkeleton />;
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-coral-blush/40 px-6 text-center">
        <p className="rounded-xl bg-pure-white/80 px-4 py-2 text-sm text-deep-teal/55 shadow-sm">
          No messages yet. Start the conversation.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex h-full flex-col overflow-y-auto bg-coral-blush/40 px-3 py-3 sm:px-4"
    >
      <div className="mt-auto flex flex-col gap-1">
        {loadingMore ? (
          <div className="flex justify-center py-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-pure-white/90 px-3 py-1.5 text-xs text-deep-teal/55 shadow-sm">
              <Loader2 className="size-3.5 animate-spin" />
              Loading older messages…
            </span>
          </div>
        ) : hasMore ? (
          <div className="flex justify-center py-1">
            <span className="text-[11px] text-deep-teal/40">Scroll up for older messages</span>
          </div>
        ) : null}

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
