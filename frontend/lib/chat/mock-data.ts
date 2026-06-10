import { MOCK_PATIENTS } from "@/lib/patients/mock-data";
import type { ChatThread, ThreadMessage } from "@/lib/chat/types";

const PROVIDER = {
  name: "Dr. Rivera",
  specialty: "Integrative Medicine",
  online: true,
};

function toThreadMessage(
  msg: { id: string; sender: "provider" | "patient"; content: string; sentAt: string },
  patientName: string,
): ThreadMessage {
  return {
    id: msg.id,
    sender: msg.sender,
    senderName: msg.sender === "provider" ? PROVIDER.name : patientName,
    content: msg.content,
    sentAt: msg.sentAt,
    messageType: "text",
  };
}

export const INITIAL_CHAT_THREADS: ChatThread[] = MOCK_PATIENTS.map((patient) => {
  const messages = patient.chatMessages.map((msg) => toThreadMessage(msg, patient.name));
  const sorted = [...messages].sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
  );
  return {
    conversationId: `mock-${patient.id}`,
    patientId: patient.id,
    patientName: patient.name,
    providerName: PROVIDER.name,
    providerSpecialty: PROVIDER.specialty,
    providerOnline: PROVIDER.online,
    messages: sorted,
    unreadProvider: patient.id === "pat-002" ? 1 : 0,
    unreadPatient: patient.id === "pat-001" ? 1 : 0,
  };
});

export const DEFAULT_PATIENT_THREAD_ID = "pat-001";
