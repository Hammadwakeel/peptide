"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChatThreadList } from "@/components/chat/ChatThreadList";
import { ProviderActiveThread } from "@/components/portal/provider/messages/ProviderActiveThread";
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
    return <p className="text-sm text-deep-teal/50">Loading messages…</p>;
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-coral-blush">{error}</p>
        <button
          type="button"
          onClick={() => void refreshThreads()}
          className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-light text-deep-teal">Messages</h1>
          <p className="mt-1 text-sm text-deep-teal/55">
            Patient conversations · also reachable from{" "}
            <Link href="/portal/doctor/customers" className="text-pacific-teal hover:underline">
              Customers
            </Link>
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="border-b border-deep-teal/10 lg:border-b-0 lg:border-r">
          <div className="border-b border-deep-teal/10 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-deep-teal/45">Threads</p>
          </div>
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
    </div>
  );
}
