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
  const { threads } = useChat();
  const patientParam = searchParams.get("patient");
  const [activePatientId, setActivePatientId] = useState<string | null>(
    patientParam ?? threads[0]?.patientId ?? null,
  );

  useEffect(() => {
    if (patientParam) {
      setActivePatientId(patientParam);
    }
  }, [patientParam]);

  const activeThread = threads.find((thread) => thread.patientId === activePatientId);

  function selectPatient(patientId: string) {
    setActivePatientId(patientId);
    router.replace(`/portal/doctor/messages?patient=${patientId}`, { scroll: false });
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
          <div className="max-h-[280px] lg:max-h-none lg:h-[calc(100dvh-220px)] lg:min-h-[420px]">
            <ChatThreadList
              threads={threads}
              activePatientId={activePatientId}
              onSelect={selectPatient}
            />
          </div>
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
