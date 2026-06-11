"use client";

import { Mic, Send, Smile } from "lucide-react";
import { Tooltip } from "@/components/ui/Tippy";
import { useRef, useState } from "react";
import { ChatAttachmentMenu } from "@/components/chat/ChatAttachmentMenu";
import { ChatMediaPreview, type PendingAttachment } from "@/components/chat/ChatMediaPreview";
import { VoiceNoteRecorder } from "@/components/chat/VoiceNoteRecorder";
import { createLocalPreviewUrl, revokePreviewUrl } from "@/lib/chat/preview";
import { useVoiceRecording } from "@/lib/chat/useVoiceRecording";
import { CHAT_MAX_CHARS, type ChatMediaMessageType } from "@/lib/chat/types";

export type { ChatMediaMessageType };

type ChatMessageInputProps = {
  onSend: (content: string) => Promise<void> | void;
  onUpload?: (
    file: File,
    messageType: ChatMediaMessageType,
    options?: { content?: string; mediaDurationMs?: number },
  ) => Promise<void> | void;
  placeholder?: string;
  draft?: string;
  onDraftChange?: (value: string) => void;
  disabled?: boolean;
};

export function ChatMessageInput({
  onSend,
  onUpload,
  placeholder = "Type a message",
  draft: controlledDraft,
  onDraftChange,
  disabled = false,
}: ChatMessageInputProps) {
  const [internalDraft, setInternalDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachment, setAttachment] = useState<PendingAttachment | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const voiceRecording = useVoiceRecording(isRecording);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const draft = controlledDraft ?? internalDraft;
  const setDraft = onDraftChange ?? setInternalDraft;
  const hasText = draft.trim().length > 0;
  const canAttach = Boolean(onUpload) && !disabled;

  function handleSendText() {
    const content = draft.trim();
    if (!content || disabled) return;
    setDraft("");
    void Promise.resolve(onSend(content)).catch(() => {
      // Optimistic rollback handled in ChatProvider.
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendText();
    }
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>, messageType: ChatMediaMessageType) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !onUpload) return;

    const placeholderAttachment: PendingAttachment = {
      file,
      messageType,
      previewUrl: messageType === "document" ? "" : "",
    };
    setAttachment(placeholderAttachment);

    void createLocalPreviewUrl(file, messageType)
      .then((previewUrl) => {
        setAttachment((current) =>
          current?.file === file && current.messageType === messageType
            ? { ...current, previewUrl }
            : current,
        );
      })
      .catch(() => {
        setAttachment(null);
      });
  }

  function handleSendAttachment(caption: string) {
    if (!attachment || !onUpload) return;

    const current = attachment;
    revokePreviewUrl(current.previewUrl);
    setAttachment(null);

    void onUpload(current.file, current.messageType, {
      content:
        caption || (current.messageType === "document" ? current.file.name : undefined),
    }).catch(() => {
      // Optimistic rollback handled in ChatProvider.
    });
  }

  function handleCancelAttachment() {
    if (attachment?.previewUrl) {
      revokePreviewUrl(attachment.previewUrl);
    }
    setAttachment(null);
  }

  if (isRecording && onUpload) {
    return (
      <VoiceNoteRecorder
        recording={voiceRecording}
        disabled={disabled}
        onCancel={() => setIsRecording(false)}
        onSend={async (file, durationMs) => {
          setIsRecording(false);
          try {
            await onUpload(file, "voice", { mediaDurationMs: durationMs });
          } catch {
            // Optimistic rollback handled in ChatProvider.
          }
        }}
      />
    );
  }

  if (attachment) {
    return (
      <ChatMediaPreview
        attachment={attachment}
        disabled={disabled}
        onCancel={handleCancelAttachment}
        onSend={handleSendAttachment}
      />
    );
  }

  return (
    <div className="border-t border-deep-teal/10 bg-pure-white">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => handleFileSelected(event, "image")}
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="hidden"
        onChange={(event) => handleFileSelected(event, "document")}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/webm,audio/mpeg,audio/mp4,audio/ogg,audio/wav"
        className="hidden"
        onChange={(event) => handleFileSelected(event, "voice")}
      />

      <div className="flex items-end gap-2 px-3 py-3">
        {onUpload ? (
          <ChatAttachmentMenu
            open={menuOpen}
            onToggle={() => setMenuOpen((value) => !value)}
            onClose={() => setMenuOpen(false)}
            disabled={!canAttach}
            onPickImage={() => imageInputRef.current?.click()}
            onPickDocument={() => documentInputRef.current?.click()}
            onPickAudio={() => audioInputRef.current?.click()}
          />
        ) : null}

        <div className="flex min-h-10 flex-1 items-end gap-2 rounded-3xl border border-deep-teal/12 bg-deep-teal/[0.03] px-3 py-2">
          <Tooltip content="Emoji picker (coming soon)">
            <button
              type="button"
              className="mb-0.5 shrink-0 text-deep-teal/45 hover:text-deep-teal"
              aria-label="Emoji"
              tabIndex={-1}
            >
              <Smile className="size-5" />
            </button>
          </Tooltip>

          <textarea
            value={draft}
            onChange={(event) => {
              if (event.target.value.length <= CHAT_MAX_CHARS) {
                setDraft(event.target.value);
              }
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            placeholder={placeholder}
            className="max-h-28 min-h-[24px] flex-1 resize-none bg-transparent py-0.5 text-sm leading-6 text-deep-teal outline-none placeholder:text-deep-teal/40 disabled:opacity-60"
          />
        </div>

        {hasText ? (
          <Tooltip content="Send message">
            <button
              type="button"
              onClick={handleSendText}
              disabled={disabled}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-deep-teal text-pure-white hover:bg-pacific-teal disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="size-4" />
            </button>
          </Tooltip>
        ) : onUpload ? (
          <Tooltip content="Record voice message">
            <button
              type="button"
              onClick={() => setIsRecording(true)}
              disabled={disabled}
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-deep-teal/70 hover:bg-deep-teal/5 hover:text-deep-teal disabled:opacity-40"
              aria-label="Record voice message"
            >
              <Mic className="size-5" />
            </button>
          </Tooltip>
        ) : (
          <Tooltip content="Send message">
            <button
              type="button"
              onClick={handleSendText}
              disabled={disabled}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-deep-teal text-pure-white hover:bg-pacific-teal disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="size-4" />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
