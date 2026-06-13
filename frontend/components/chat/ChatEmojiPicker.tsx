"use client";

import { Smile, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Tooltip } from "@/components/ui/Tippy";
import type { ReplyTarget } from "@/lib/chat/types";

export const CHAT_QUICK_EMOJIS = ["👍", "❤️", "😊", "🙏", "✅", "👏"] as const;

type ChatEmojiPickerProps = {
  open: boolean;
  onClose: () => void;
  onPick: (emoji: string) => void;
  className?: string;
};

export function ChatEmojiPicker({ open, onClose, onPick, className = "" }: ChatEmojiPickerProps) {
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
      className={`absolute bottom-full left-0 z-30 mb-2 flex gap-1 rounded-2xl border border-deep-teal/10 bg-pure-white p-2 shadow-lg ${className}`}
      role="listbox"
      aria-label="Emoji reactions"
    >
      {CHAT_QUICK_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          role="option"
          onClick={() => {
            onPick(emoji);
            onClose();
          }}
          className="flex size-9 items-center justify-center rounded-xl text-lg transition-colors hover:bg-deep-teal/5"
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export function ChatInputEmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
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
      <ChatEmojiPicker open={open} onClose={() => setOpen(false)} onPick={onPick} />
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
        <p className="text-[10px] font-medium uppercase tracking-wide text-pacific-teal">
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
