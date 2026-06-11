"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageSquare, RefreshCw } from "lucide-react";
import { ChatThreadList } from "@/components/chat/ChatThreadList";
import { ProviderActiveThread } from "@/components/portal/provider/messages/ProviderActiveThread";
import { ProviderPageSection } from "@/components/portal/provider/shared/ProviderPageSection";
import {
  ProviderPageToolbar,
  toolbarBtnPrimaryClass,
} from "@/components/portal/provider/shared/ProviderPageToolbar";
import { useChat } from "@/context/ChatProvider";

export function ProviderChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { threads, loading, error, ensureDoctorThread, refreshThreads } = useChat();
  const patientParam = searchParams.get("patient");
  const [activePatientId, setActivePatientId] = useState<string | null>(
    patientParam ?? threads[0]?.patientId ?? null,
  );

  useEffect(() => {
    if (patientParam) {
      setActivePatientId(patientParam);
      void ensureDoctorThread(patientParam);
    }
  }, [patientParam, ensureDoctorThread]);

  useEffect(() => {
    if (!patientParam && !activePatientId && threads[0]?.patientId) {
      setActivePatientId(threads[0].patientId);
    }
  }, [threads, patientParam, activePatientId]);

  const activeThread = threads.find((thread) => thread.patientId === activePatientId);

  function selectPatient(patientId: string) {
    setActivePatientId(patientId);
    router.replace(`/portal/doctor/messages?patient=${patientId}`, { scroll: false });
    void ensureDoctorThread(patientId);
  }

  if (loading) {
    return <p className="py-12 text-center text-sm text-deep-teal/50">Loading messages…</p>;
  }

  if (error) {
    return (
      <div className="space-y-5">
        <ProviderPageToolbar title="Messages" />
        <p className="text-sm text-coral-blush">{error}</p>
        <button
          type="button"
          onClick={() => void refreshThreads({ force: true })}
          className={toolbarBtnPrimaryClass}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ProviderPageToolbar title="Messages">
        <button
          type="button"
          onClick={() => void refreshThreads({ force: true })}
          className={toolbarBtnPrimaryClass}
          aria-label="Refresh messages"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
        </button>
      </ProviderPageToolbar>

      <ProviderPageSection
        icon={MessageSquare}
        title="Conversations"
        subtitle={`${threads.length} thread${threads.length === 1 ? "" : "s"}`}
        noPadding
      >
        <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="border-b border-deep-teal/10 lg:border-b-0 lg:border-r">
            {threads.length === 0 ? (
              <p className="px-4 py-6 text-sm text-deep-teal/50">
                No conversations yet. Start one from a patient profile or customer list.
              </p>
            ) : (
              <ChatThreadList
                threads={threads}
                activePatientId={activePatientId}
                onSelect={selectPatient}
              />
            )}
          </div>
          <div>
            {activeThread ? (
              <ProviderActiveThread thread={activeThread} />
            ) : (
              <div className="flex h-[420px] items-center justify-center text-sm text-deep-teal/50">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      </ProviderPageSection>
    </div>
  );
}
