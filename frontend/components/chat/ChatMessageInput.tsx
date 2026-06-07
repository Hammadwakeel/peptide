"use client";

import { useState } from "react";
import { CHAT_MAX_CHARS } from "@/lib/chat/types";

type ChatMessageInputProps = {
  onSend: (content: string) => Promise<void> | void;
  placeholder?: string;
  draft?: string;
  onDraftChange?: (value: string) => void;
};

export function ChatMessageInput({
  onSend,
  placeholder = "Type a message…",
  draft: controlledDraft,
  onDraftChange,
}: ChatMessageInputProps) {
  const [internalDraft, setInternalDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  const draft = controlledDraft ?? internalDraft;
  const setDraft = onDraftChange ?? setInternalDraft;
  const remaining = CHAT_MAX_CHARS - draft.length;

  async function handleSend() {
    const content = draft.trim();
    if (!content || isSending) return;
    setIsSending(true);
    try {
      await onSend(content);
      setDraft("");
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  return (
    <div className="border-t border-deep-teal/10 bg-pure-white p-4">
      <textarea
        value={draft}
        onChange={(e) => {
          if (e.target.value.length <= CHAT_MAX_CHARS) {
            setDraft(e.target.value);
          }
        }}
        onKeyDown={handleKeyDown}
        disabled={isSending}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-deep-teal/15 px-3 py-2 text-sm text-deep-teal outline-none focus:border-pacific-teal disabled:opacity-60"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className={`text-xs ${remaining < 100 ? "text-coral-blush" : "text-deep-teal/45"}`}>
          {draft.length}/{CHAT_MAX_CHARS}
        </span>
        <button
          type="button"
          disabled={isSending || !draft.trim()}
          onClick={() => void handleSend()}
          className="rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-pacific-teal disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSending ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}
