"use client";

import { Plus, Smile, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Tooltip } from "@/components/ui/Tippy";
import {
  CHAT_QUICK_REACTION_EMOJIS,
  CHAT_REACTION_EMOJIS,
} from "@/lib/chat/constants";
import type { ReplyTarget } from "@/lib/chat/types";

type ChatEmojiGridProps = {
  emojis: readonly string[];
  onPick: (emoji: string) => void;
  columns?: number;
  maxHeightClass?: string;
};

function ChatEmojiGrid({
  emojis,
  onPick,
  columns = 8,
  maxHeightClass = "max-h-44",
}: ChatEmojiGridProps) {
  return (
    <div
      className={`grid ${maxHeightClass} gap-0.5 overflow-y-auto overscroll-contain pr-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onPick(emoji)}
          className="flex size-9 items-center justify-center rounded-xl text-lg transition-colors hover:bg-deep-teal/5 active:scale-95"
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

type ChatReactionBarProps = {
  onPick: (emoji: string) => void;
  className?: string;
  onExpandedChange?: (expanded: boolean) => void;
};

/** Quick reactions + plus button to open the full emoji grid. */
export function ChatReactionBar({ onPick, className = "", onExpandedChange }: ChatReactionBarProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    onExpandedChange?.(showAll);
  }, [showAll, onExpandedChange]);

  useEffect(() => {
    if (!showAll) return;
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setShowAll(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showAll]);

  function pick(emoji: string) {
    onPick(emoji);
    setShowAll(false);
  }

  return (
    <div ref={rootRef} className={`flex flex-col items-end gap-1.5 ${className}`}>
      {showAll ? (
        <div
          className="w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-deep-teal/10 bg-pure-white p-2 shadow-lg"
          role="listbox"
          aria-label="All emoji reactions"
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[11px] font-light text-deep-teal/55">All reactions</span>
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className="rounded-full p-1 text-deep-teal/45 hover:bg-deep-teal/5 hover:text-deep-teal"
              aria-label="Close emoji picker"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <ChatEmojiGrid emojis={CHAT_REACTION_EMOJIS} onPick={pick} columns={8} />
        </div>
      ) : null}

      <div className="flex items-center gap-0.5 rounded-full border border-deep-teal/10 bg-pure-white p-1 shadow-md">
        {CHAT_QUICK_REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => pick(emoji)}
            className="flex size-8 items-center justify-center rounded-full text-lg transition-transform hover:scale-110 hover:bg-deep-teal/5 active:scale-95"
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
        <Tooltip content="More reactions">
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className={`flex size-8 items-center justify-center rounded-full border transition-colors ${
              showAll
                ? "border-pacific-teal/30 bg-pacific-teal/10 text-pacific-teal"
                : "border-deep-teal/10 text-deep-teal/55 hover:bg-deep-teal/5 hover:text-deep-teal"
            }`}
            aria-label="More reactions"
            aria-expanded={showAll}
          >
            <Plus className="size-4" strokeWidth={2} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

type ChatEmojiPickerProps = {
  open: boolean;
  onClose: () => void;
  onPick: (emoji: string) => void;
  className?: string;
  emojis?: readonly string[];
  columns?: number;
};

export function ChatEmojiPicker({
  open,
  onClose,
  onPick,
  className = "",
  emojis = CHAT_REACTION_EMOJIS,
  columns = 8,
}: ChatEmojiPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      className={`absolute bottom-full left-0 z-30 mb-2 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-deep-teal/10 bg-pure-white p-2 shadow-lg ${className}`}
      role="listbox"
      aria-label="Emoji reactions"
    >
      <ChatEmojiGrid
        emojis={emojis}
        onPick={(emoji) => {
          onPick(emoji);
          onClose();
        }}
        columns={columns}
      />
    </div>
  );
}

export function ChatInputEmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) setShowAll(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <Tooltip content="Insert emoji">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={`mb-0.5 rounded-full p-0.5 transition-colors ${
            open ? "text-pacific-teal" : "text-deep-teal/45 hover:text-deep-teal"
          }`}
          aria-label="Insert emoji"
          aria-expanded={open}
        >
          <Smile className="size-5" />
        </button>
      </Tooltip>

      {open ? (
        <div className="absolute bottom-full left-0 z-30 mb-2 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-deep-teal/10 bg-pure-white p-2 shadow-lg">
          {!showAll ? (
            <>
              <div className="mb-2 flex flex-wrap items-center gap-0.5">
                {CHAT_QUICK_REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onPick(emoji);
                      setOpen(false);
                    }}
                    className="flex size-9 items-center justify-center rounded-xl text-lg hover:bg-deep-teal/5"
                    aria-label={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="flex size-9 items-center justify-center rounded-xl border border-dashed border-deep-teal/15 text-deep-teal/55 hover:bg-deep-teal/5 hover:text-deep-teal"
                  aria-label="More emojis"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => setShowAll(false)}
                  className="text-[11px] font-light text-pacific-teal hover:underline"
                >
                  Back
                </button>
                <span className="text-[11px] font-light text-deep-teal/55">All emojis</span>
              </div>
              <ChatEmojiGrid
                emojis={CHAT_REACTION_EMOJIS}
                onPick={(emoji) => {
                  onPick(emoji);
                  setOpen(false);
                  setShowAll(false);
                }}
                columns={8}
              />
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

type ChatReplyBarProps = {
  replyTo: ReplyTarget;
  onCancel: () => void;
};

export function ChatReplyBar({ replyTo, onCancel }: ChatReplyBarProps) {
  return (
    <div className="flex items-start gap-3 border-b border-deep-teal/10 bg-surface-muted/40 px-4 py-2.5">
      <div className="min-w-0 flex-1 border-l-2 border-pacific-teal pl-3">
        <p className="text-[10px] font-light uppercase tracking-wide text-pacific-teal">
          Replying to {replyTo.senderName}
        </p>
        <p className="mt-0.5 truncate text-sm text-deep-teal/70">{replyTo.preview}</p>
      </div>
      <Tooltip content="Cancel reply">
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 rounded-full p-1 text-deep-teal/45 hover:bg-deep-teal/5 hover:text-deep-teal"
          aria-label="Cancel reply"
        >
          <X className="size-4" />
        </button>
      </Tooltip>
    </div>
  );
}
