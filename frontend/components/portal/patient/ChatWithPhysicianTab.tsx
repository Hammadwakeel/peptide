"use client";

import { useEffect, useState } from "react";
import { ChatMessageInput } from "@/components/chat/ChatMessageInput";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
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
  const { getThread, defaultPatientId, sendMessage, markRead } = useChat();
  const thread = getThread(defaultPatientId);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (thread) {
      markRead(thread.patientId, "patient");
    }
  }, [thread, markRead]);

  if (!thread) {
    return <p className="text-sm text-deep-teal/50">Unable to load chat.</p>;
  }

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-2xl font-light text-deep-teal">Chat with Physician</h1>

      <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-4 shadow-sm sm:p-5">
        <div className="flex items-start gap-4">
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
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-medium text-deep-teal">{thread.providerName}</h2>
              <span className="rounded-full bg-pacific-teal/10 px-2 py-0.5 text-xs font-medium text-pacific-teal">
                Active
              </span>
            </div>
            <p className="mt-0.5 text-sm text-deep-teal/60">{thread.providerSpecialty}</p>
            <OnlineIndicator online={thread.providerOnline} />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
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

      <div className="overflow-hidden rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
        <div className="h-[420px] overflow-hidden">
          <ChatMessageList messages={thread.messages} viewerRole="patient" />
        </div>
        <ChatMessageInput
          draft={draft}
          onDraftChange={setDraft}
          onSend={(content) => {
            sendMessage(thread.patientId, "patient", thread.patientName, content);
          }}
        />
      </div>
    </div>
  );
}
