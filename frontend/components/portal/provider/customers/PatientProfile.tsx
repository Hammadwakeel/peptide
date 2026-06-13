"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, MessageSquare, User } from "lucide-react";
import { ProviderPageSection } from "@/components/portal/provider/shared/ProviderPageSection";
import {
  ProviderPageToolbar,
  toolbarBtnClass,
  toolbarBtnPrimaryClass,
} from "@/components/portal/provider/shared/ProviderPageToolbar";
import { ProviderActiveThread } from "@/components/portal/provider/messages/ProviderActiveThread";
import { OrderHistoryTab } from "@/components/portal/provider/customers/tabs/OrderHistoryTab";
import { CustomerInformationTab } from "@/components/portal/provider/customers/tabs/CustomerInformationTab";
import { PatientNotesTab } from "@/components/portal/provider/customers/tabs/PatientNotesTab";
import { RequestsTab } from "@/components/portal/provider/customers/tabs/RequestsTab";
import { useChat } from "@/context/ChatProvider";
import { usePatients } from "@/context/PatientsProvider";
import {
  getPatientInitials,
  PATIENT_STATUS_LABELS,
  PROFILE_TAB_LABELS,
  type PatientProfileTab,
  type PatientStatus,
} from "@/lib/patients/types";
import { toast } from "@/lib/toast";

function StatusPill({ status }: { status: PatientStatus }) {
  const styles = {
    active: "bg-pacific-teal/10 text-pacific-teal",
    inactive: "bg-deep-teal/10 text-deep-teal/55",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-light ${styles[status]}`}>
      {PATIENT_STATUS_LABELS[status]}
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDob(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type PatientProfileProps = {
  patientId: string;
};

export function PatientProfile({ patientId }: PatientProfileProps) {
  const searchParams = useSearchParams();
  const { getPatient } = usePatients();
  const { getThread, ensureDoctorThread } = useChat();
  const patient = getPatient(patientId);
  const chatThread = getThread(patientId);
  const [activeTab, setActiveTab] = useState<PatientProfileTab>("orders");
  const [chatReady, setChatReady] = useState(false);

  useEffect(() => {
    if (activeTab === "chat") {
      void ensureDoctorThread(patientId).finally(() => setChatReady(true));
    }
  }, [activeTab, patientId, ensureDoctorThread]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "chat" || tab === "orders" || tab === "notes" || tab === "requests" || tab === "information") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (!patient) {
    return (
      <div className="space-y-5">
        <ProviderPageToolbar title="Patient not found">
          <Link href="/portal/doctor/customers" className={toolbarBtnClass}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back</span>
          </Link>
        </ProviderPageToolbar>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ProviderPageToolbar title={patient.name}>
        <Link href="/portal/doctor/customers" className={toolbarBtnClass}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Back</span>
        </Link>
        <Link
          href={`/portal/doctor/messages?patient=${patient.id}`}
          className={toolbarBtnClass}
        >
          <MessageSquare className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Chat</span>
        </Link>
        <button
          type="button"
          onClick={() => toast.success(`Create order flow opened for ${patient.name}.`)}
          className={toolbarBtnPrimaryClass}
        >
          Create order
        </button>
      </ProviderPageToolbar>

      <ProviderPageSection
        icon={User}
        title="Patient profile"
        subtitle={`${patient.totalOrders} order${patient.totalOrders === 1 ? "" : "s"} · ${PATIENT_STATUS_LABELS[patient.status]}`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-deep-teal/10 text-lg font-light text-deep-teal">
            {getPatientInitials(patient.name)}
          </span>
          <div className="flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusPill status={patient.status} />
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-deep-teal/45">Email</dt>
                  <dd className="text-deep-teal">{patient.email}</dd>
                </div>
                <div>
                  <dt className="text-deep-teal/45">Phone</dt>
                  <dd className="text-deep-teal">{patient.phone}</dd>
                </div>
                <div>
                  <dt className="text-deep-teal/45">Date of birth</dt>
                  <dd className="text-deep-teal">{formatDob(patient.dateOfBirth)}</dd>
                </div>
                <div>
                  <dt className="text-deep-teal/45">Total orders</dt>
                  <dd className="text-deep-teal">{patient.totalOrders}</dd>
                </div>
                <div>
                  <dt className="text-deep-teal/45">Last order date</dt>
                  <dd className="text-deep-teal">{formatDate(patient.lastOrderDate)}</dd>
                </div>
              </dl>
          </div>
        </div>
      </ProviderPageSection>

      <ProviderPageSection icon={User} title="Records" noPadding>
        <div className="flex flex-wrap gap-2 border-b border-deep-teal/10 p-4 sm:px-5">
          {(Object.keys(PROFILE_TAB_LABELS) as PatientProfileTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-xs font-light sm:text-sm ${
                activeTab === tab
                  ? "bg-deep-teal text-pure-white"
                  : "text-deep-teal/65 hover:bg-deep-teal/5"
              }`}
            >
              {PROFILE_TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === "orders" ? <OrderHistoryTab orders={patient.orders} /> : null}
          {activeTab === "chat" ? (
            chatThread ? (
              <div className="overflow-hidden rounded-xl border border-deep-teal/10">
                <ProviderActiveThread thread={chatThread} compact />
              </div>
            ) : chatReady ? (
              <p className="text-sm text-deep-teal/50">No chat thread for this patient yet.</p>
            ) : (
              <p className="text-sm text-deep-teal/50">Loading chat…</p>
            )
          ) : null}
          {activeTab === "notes" ? (
            <PatientNotesTab patientId={patient.id} notes={patient.notes} />
          ) : null}
          {activeTab === "requests" ? (
            <RequestsTab
              patientId={patient.id}
              patientName={patient.name}
              requests={patient.requests}
              onChat={() => setActiveTab("chat")}
            />
          ) : null}
          {activeTab === "information" ? <CustomerInformationTab patient={patient} /> : null}
        </div>
      </ProviderPageSection>
    </div>
  );
}
