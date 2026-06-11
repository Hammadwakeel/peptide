"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { ChatMessageInput } from "@/components/chat/ChatMessageInput";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { PortalPageSection } from "@/components/portal/shared/PortalPageSection";
import { PortalPageToolbar } from "@/components/portal/shared/PortalPageToolbar";
import { useChat } from "@/context/ChatProvider";
import { PATIENT_QUICK_TEMPLATES } from "@/lib/chat/types";

function OnlineIndicator({ online }: { online: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-deep-teal/55">
      <span
        className={`size-2 rounded-full ${online ? "bg-pacific-teal" : "bg-deep-teal/25"}`}
        aria-hidden="true"
      />
      {online ? "Online" : "Offline"}
    </span>
  );
}

export function ChatWithPhysicianTab() {
  const { threads, loading, error, sendMessage, sendMedia, markRead, loadMessages } = useChat();
  const thread = threads[0];
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (thread) {
      void loadMessages(thread.conversationId);
      void markRead(thread.conversationId, "patient");
    }
  }, [thread?.conversationId, loadMessages, markRead]);

  if (loading) {
    return <p className="py-12 text-center text-sm text-deep-teal/50">Loading chat…</p>;
  }

  if (error) {
    return (
      <div className="space-y-5">
        <PortalPageToolbar title="Chat" />
        <p className="text-sm text-coral-blush">{error}</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="space-y-5">
        <PortalPageToolbar title="Chat" />
        <p className="text-sm text-deep-teal/50">Unable to load chat.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PortalPageToolbar title="Chat with Physician" />

      <PortalPageSection
        icon={MessageSquare}
        title={thread.providerName}
        subtitle={thread.providerSpecialty ?? "Your physician"}
      >
        <div className="mb-4 flex items-start gap-4">
          <span className="relative flex size-14 shrink-0 items-center justify-center rounded-full bg-deep-teal/10 text-lg font-medium text-deep-teal">
            DR
            <span
              className={`absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-pure-white ${
                thread.providerOnline ? "bg-pacific-teal" : "bg-deep-teal/25"
              }`}
              aria-hidden="true"
            />
          </span>
          <div>
            <span className="rounded-full bg-pacific-teal/10 px-2 py-0.5 text-xs font-medium text-pacific-teal">
              Active
            </span>
            <div className="mt-2">
              <OnlineIndicator online={thread.providerOnline} />
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {PATIENT_QUICK_TEMPLATES.map((template) => (
            <button
              key={template}
              type="button"
              onClick={() => setDraft(template)}
              className="rounded-full border border-deep-teal/15 px-3 py-1.5 text-xs text-deep-teal/70 hover:border-pacific-teal hover:text-deep-teal"
            >
              {template}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-deep-teal/10">
          <div className="h-[420px] overflow-hidden">
            <ChatMessageList messages={thread.messages} viewerRole="patient" />
          </div>
          <ChatMessageInput
            draft={draft}
            onDraftChange={setDraft}
            onSend={(content) => sendMessage(thread.conversationId, content)}
            onUpload={(file, messageType) => sendMedia(thread.conversationId, file, messageType)}
          />
        </div>
      </PortalPageSection>
    </div>
  );
}
