"use client";

import { FileText, Loader2, Music, Send, X } from "lucide-react";
import { Tooltip, TruncateTooltip } from "@/components/ui/Tippy";
import { useState } from "react";
import type { ChatMediaMessageType } from "@/lib/chat/types";

export type PendingAttachment = {
  file: File;
  messageType: ChatMediaMessageType;
  previewUrl: string;
};

type ChatMediaPreviewProps = {
  attachment: PendingAttachment;
  onCancel: () => void;
  onSend: (caption: string) => void;
  disabled?: boolean;
};

export function ChatMediaPreview({ attachment, onCancel, onSend, disabled = false }: ChatMediaPreviewProps) {
  const [caption, setCaption] = useState("");

  function handleSend() {
    if (disabled) return;
    onSend(caption.trim());
  }

  return (
    <div className="border-t border-deep-teal/10 bg-deep-teal/[0.03]">
      <div className="flex items-center justify-between px-4 py-2">
        <p className="text-xs font-light uppercase tracking-wide text-deep-teal/50">Preview</p>
        <Tooltip content="Cancel attachment">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1 text-deep-teal/50 hover:bg-deep-teal/5 hover:text-deep-teal"
            aria-label="Cancel attachment"
          >
            <X className="size-4" />
          </button>
        </Tooltip>
      </div>

      <div className="px-4 pb-3">
        {attachment.messageType === "image" ? (
          <div className="overflow-hidden rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
            {attachment.previewUrl ? (
              <img
                src={attachment.previewUrl}
                alt={attachment.file.name}
                className="max-h-72 w-full object-contain bg-deep-teal/[0.02]"
              />
            ) : (
              <div className="flex h-48 items-center justify-center text-deep-teal/45">
                <Loader2 className="size-6 animate-spin" />
              </div>
            )}
          </div>
        ) : null}

        {attachment.messageType === "document" ? (
          <div className="flex items-center gap-3 rounded-2xl border border-deep-teal/10 bg-pure-white p-4 shadow-sm">
            <span className="flex size-12 items-center justify-center rounded-xl bg-deep-teal/10 text-deep-teal">
              <FileText className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <TruncateTooltip content={attachment.file.name}>
                <p className="truncate text-sm font-light text-deep-teal">{attachment.file.name}</p>
              </TruncateTooltip>
              <p className="text-xs text-deep-teal/50">
                {(attachment.file.size / 1024).toFixed(1)} KB · Document
              </p>
            </div>
          </div>
        ) : null}

        {attachment.messageType === "voice" ? (
          <div className="rounded-2xl border border-deep-teal/10 bg-pure-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-deep-teal">
              <Music className="size-5" />
              <TruncateTooltip content={attachment.file.name}>
                <span className="truncate text-sm font-light">{attachment.file.name}</span>
              </TruncateTooltip>
            </div>
            {attachment.previewUrl ? (
              <audio controls src={attachment.previewUrl} className="w-full" />
            ) : (
              <div className="flex h-12 items-center justify-center text-deep-teal/45">
                <Loader2 className="size-5 animate-spin" />
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex items-end gap-2 border-t border-deep-teal/10 bg-pure-white px-3 py-3">
        <input
          type="text"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder={
            attachment.messageType === "image"
              ? "Add a caption…"
              : attachment.messageType === "document"
                ? "Add a message (optional)…"
                : "Add a note (optional)…"
          }
          disabled={disabled}
          className="min-h-10 flex-1 rounded-full border border-deep-teal/15 bg-deep-teal/[0.02] px-4 py-2 text-sm text-deep-teal outline-none focus:border-pacific-teal disabled:opacity-60"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSend();
            }
          }}
        />
        <Tooltip content="Send attachment">
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || (attachment.messageType === "image" && !attachment.previewUrl)}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-deep-teal text-pure-white hover:bg-pacific-teal disabled:opacity-40"
            aria-label="Send attachment"
          >
            <Send className="size-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
