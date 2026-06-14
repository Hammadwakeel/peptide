"use client";

import { ArrowLeft, Download, FileText, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ApplyTabs } from "@/components/apply/wizard/ApplyTabs";
import { ChatProfileSidebarSkeleton } from "@/components/chat/ChatSkeletons";
import { VoiceMessageBubble } from "@/components/chat/VoiceMessageBubble";
import { useChat } from "@/context/ChatProvider";
import {
  groupSharedMediaMessages,
  mediaDownloadFilename,
  triggerMediaDownload,
  type SharedMediaTab,
} from "@/lib/chat/media-utils";
import { formatBubbleTime, type ThreadMessage } from "@/lib/chat/types";

type ChatProfileModalProps = {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  contactName: string;
  contactInitials: string;
  contactSubtitle?: string;
  online?: boolean;
};

const PROFILE_TABS = [
  { id: "media", label: "Media" },
  { id: "audio", label: "Audio" },
  { id: "docs", label: "Docs" },
] as const;

function sortNewestFirst(messages: ThreadMessage[]) {
  return [...messages].sort(
    (left, right) => new Date(right.sentAt).getTime() - new Date(left.sentAt).getTime(),
  );
}

function SharedMediaGrid({
  messages,
  onSelect,
}: {
  messages: ThreadMessage[];
  onSelect: (message: ThreadMessage) => void;
}) {
  if (messages.length === 0) {
    return <EmptyTab message="No photos or images shared in this chat yet." />;
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {messages.map((message) => (
        <button
          key={message.id}
          type="button"
          onClick={() => onSelect(message)}
          className="group relative aspect-square overflow-hidden rounded-lg bg-deep-teal/4"
        >
          <img
            src={message.mediaUrl!}
            alt={message.content || "Shared image"}
            className="size-full object-cover transition-transform group-hover:scale-[1.03]"
          />
          <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-deep-teal/70 to-transparent px-1.5 py-1 text-[10px] text-pure-white">
            {formatBubbleTime(message.sentAt)}
          </span>
        </button>
      ))}
    </div>
  );
}

function SharedAudioList({ messages }: { messages: ThreadMessage[] }) {
  if (messages.length === 0) {
    return <EmptyTab message="No voice messages in this chat yet." />;
  }

  return (
    <ul className="space-y-2">
      {messages.map((message) => (
        <li
          key={message.id}
          className="rounded-xl border border-deep-teal/10 bg-surface-muted/20 px-3 py-2.5"
        >
          <div className="mb-2 flex items-center justify-between gap-2 text-xs text-deep-teal/55">
            <span className="truncate font-light text-deep-teal/75">{message.senderName}</span>
            <time dateTime={message.sentAt}>{formatBubbleTime(message.sentAt)}</time>
          </div>
          <VoiceMessageBubble
            mediaUrl={message.mediaUrl!}
            durationMs={message.mediaDurationMs}
            messageId={message.id}
            isOwn={false}
          />
        </li>
      ))}
    </ul>
  );
}

function SharedDocsList({ messages }: { messages: ThreadMessage[] }) {
  if (messages.length === 0) {
    return <EmptyTab message="No documents shared in this chat yet." />;
  }

  return (
    <ul className="space-y-2">
      {messages.map((message) => {
        const filename = mediaDownloadFilename(message.messageType, message.content, message.mediaMime);

        return (
          <li key={message.id}>
            <div className="flex items-center gap-3 rounded-xl border border-deep-teal/10 bg-surface-muted/20 p-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-deep-teal/10 text-deep-teal">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-light text-deep-teal">{message.content || "Document"}</p>
                <p className="text-xs text-deep-teal/50">
                  {message.senderName} · {formatBubbleTime(message.sentAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => triggerMediaDownload(message.mediaUrl!, filename)}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-deep-teal/8 text-deep-teal hover:bg-deep-teal/12"
                aria-label={`Download ${message.content || "document"}`}
              >
                <Download className="size-4" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function EmptyTab({ message }: { message: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center px-4 text-center text-sm text-deep-teal/45">
      {message}
    </div>
  );
}

function ImageLightbox({
  message,
  onClose,
}: {
  message: ThreadMessage;
  onClose: () => void;
}) {
  const filename = mediaDownloadFilename(message.messageType, message.content, message.mediaMime);

  return (
    <div className="fixed inset-0 z-60 flex flex-col bg-deep-teal/95">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="flex size-9 items-center justify-center rounded-full text-pure-white hover:bg-pure-white/10"
          aria-label="Close preview"
        >
          <X className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => triggerMediaDownload(message.mediaUrl!, filename)}
          className="inline-flex items-center gap-1.5 rounded-full bg-pure-white/15 px-3 py-1.5 text-sm text-pure-white hover:bg-pure-white/25"
        >
          <Download className="size-4" />
          Download
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <img
          src={message.mediaUrl!}
          alt={message.content || "Shared image"}
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <div className="px-4 pb-6 text-center text-sm text-pure-white/75">
        <p>{message.senderName}</p>
        <p className="text-xs text-pure-white/55">{formatBubbleTime(message.sentAt)}</p>
      </div>
    </div>
  );
}

export function ChatProfileModal({
  open,
  onClose,
  conversationId,
  contactName,
  contactInitials,
  contactSubtitle,
  online,
}: ChatProfileModalProps) {
  const { threads, loadAllMessages } = useChat();
  const [activeTab, setActiveTab] = useState<SharedMediaTab>("media");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [previewImage, setPreviewImage] = useState<ThreadMessage | null>(null);
  const [entered, setEntered] = useState(false);

  const thread = threads.find((item) => item.conversationId === conversationId);
  const grouped = useMemo(() => {
    const buckets = groupSharedMediaMessages(thread?.messages ?? []);
    return {
      media: sortNewestFirst(buckets.media),
      audio: sortNewestFirst(buckets.audio),
      docs: sortNewestFirst(buckets.docs),
    };
  }, [thread?.messages]);

  useEffect(() => {
    if (!open) {
      setPreviewImage(null);
      setEntered(false);
      return;
    }

    const frame = requestAnimationFrame(() => setEntered(true));

    let cancelled = false;
    setLoadingHistory(true);
    void loadAllMessages(conversationId).finally(() => {
      if (!cancelled) setLoadingHistory(false);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [open, conversationId, loadAllMessages]);

  if (!open) return null;

  const tabsWithCounts = PROFILE_TABS.map((tab) => {
    const count = grouped[tab.id as SharedMediaTab].length;
    return { ...tab, label: loadingHistory || count === 0 ? tab.label : `${tab.label} (${count})` };
  });

  return (
    <>
      <button
        type="button"
        aria-label="Close profile sidebar"
        className={`absolute inset-0 z-20 bg-deep-teal/20 transition-opacity duration-300 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-profile-title"
        className={`absolute inset-y-0 right-0 z-30 flex w-full max-w-[360px] flex-col border-l border-deep-teal/10 bg-pure-white shadow-[-8px_0_32px_rgba(1,26,36,0.08)] transition-transform duration-300 ease-out ${
          entered ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-deep-teal/8 px-3 py-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full text-deep-teal hover:bg-deep-teal/8"
            aria-label="Close profile"
          >
            <ArrowLeft className="size-5" />
          </button>
          <p className="text-sm font-light text-deep-teal/70">Contact info</p>
        </div>

        <div className="border-b border-deep-teal/8 px-6 pb-5 pt-3 text-center">
          <span className="relative mx-auto flex size-24 items-center justify-center rounded-full bg-pacific-teal/15 text-3xl font-light text-deep-teal">
            {contactInitials}
            {online !== undefined ? (
              <span
                className={`absolute bottom-1 right-1 size-4 rounded-full border-[3px] border-pure-white ${
                  online ? "bg-pacific-teal" : "bg-deep-teal/25"
                }`}
                aria-hidden="true"
              />
            ) : null}
          </span>
          <h2 id="chat-profile-title" className="mt-4 font-sans text-xl font-light text-deep-teal">
            {contactName}
          </h2>
          {contactSubtitle ? <p className="mt-1 text-sm text-deep-teal/55">{contactSubtitle}</p> : null}
          <p className="mt-3 text-xs text-deep-teal/45">Media, audio, and documents shared in this chat</p>
        </div>

        <div className="border-b border-deep-teal/8 px-4">
          <ApplyTabs
            tabs={tabsWithCounts}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as SharedMediaTab)}
            variant="secondary"
            className="gap-0"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {loadingHistory ? (
            <ChatProfileSidebarSkeleton tab={activeTab} />
          ) : null}

          {!loadingHistory && activeTab === "media" ? (
            <SharedMediaGrid messages={grouped.media} onSelect={setPreviewImage} />
          ) : null}
          {!loadingHistory && activeTab === "audio" ? <SharedAudioList messages={grouped.audio} /> : null}
          {!loadingHistory && activeTab === "docs" ? <SharedDocsList messages={grouped.docs} /> : null}
        </div>
      </aside>

      {previewImage ? <ImageLightbox message={previewImage} onClose={() => setPreviewImage(null)} /> : null}
    </>
  );
}
