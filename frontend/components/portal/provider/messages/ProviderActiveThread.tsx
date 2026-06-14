"use client";

import { useEffect, useState } from "react";
import { ChatMessageInput, toReplyTarget } from "@/components/chat/ChatMessageInput";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatProfileModal } from "@/components/chat/ChatProfileModal";
import { ChatQuickTemplates } from "@/components/chat/ChatQuickTemplates";
import { ChatThreadHeader } from "@/components/chat/ChatThreadHeader";
import { useChat } from "@/context/ChatProvider";
import { getPatientInitials } from "@/lib/patients/types";
import type { ChatThread, ReplyTarget, ThreadMessage } from "@/lib/chat/types";

type ProviderActiveThreadProps = {
  thread: ChatThread;
  compact?: boolean;
  onBack?: () => void;
};

export function ProviderActiveThread({ thread, compact = false, onBack }: ProviderActiveThreadProps) {
  const { sendMessage, sendMedia, markRead, loadMessages, loadMoreMessages, toggleReaction, getQuickTemplates, templatesLoading } = useChat();
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    void Promise.all([
      loadMessages(thread.conversationId),
      markRead(thread.conversationId, "provider"),
    ]);
  }, [thread.conversationId, loadMessages, markRead]);

  function handleReply(message: ThreadMessage) {
    setReplyTo(toReplyTarget(message));
  }

  return (
    <div className={`relative flex min-h-0 flex-1 flex-col overflow-hidden ${compact ? "h-[480px]" : ""}`}>
      <ChatThreadHeader
        avatarLabel={getPatientInitials(thread.patientName)}
        name={thread.patientName}
        subtitle="Patient"
        onBack={onBack}
        onProfileClick={() => setProfileOpen(true)}
      />

      <ChatQuickTemplates
        templates={getQuickTemplates("provider")}
        loading={templatesLoading}
        onSelect={(content) => void sendMessage(thread.conversationId, content)}
      />

      <div className="min-h-0 flex-1">
        <ChatMessageList
          messages={thread.messages}
          viewerRole="provider"
          loading={thread.messagesLoading}
          loadingMore={thread.messagesLoadingMore}
          hasMore={thread.hasMoreMessages}
          onLoadMore={() => void loadMoreMessages(thread.conversationId)}
          onReply={handleReply}
          onToggleReaction={(messageId, emoji) =>
            void toggleReaction(thread.conversationId, messageId, emoji)
          }
        />
      </div>

      <ChatMessageInput
        replyTo={replyTo}
        onReplyChange={setReplyTo}
        onSend={(content, options) => sendMessage(thread.conversationId, content, options)}
        onUpload={(file, messageType, options) =>
          sendMedia(thread.conversationId, file, messageType, options)
        }
      />

      <ChatProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        conversationId={thread.conversationId}
        contactName={thread.patientName}
        contactInitials={getPatientInitials(thread.patientName)}
        contactSubtitle="Patient"
      />
    </div>
  );
}
