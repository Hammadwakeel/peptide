export type ChatSender = "provider" | "patient";

export type ThreadMessage = {
  id: string;
  sender: ChatSender;
  senderName: string;
  content: string;
  sentAt: string;
};

export type ChatThread = {
  patientId: string;
  patientName: string;
  providerName: string;
  providerSpecialty: string;
  providerOnline: boolean;
  messages: ThreadMessage[];
  unreadProvider: number;
  unreadPatient: number;
};

export const CHAT_MAX_CHARS = 2000;

export const PATIENT_QUICK_TEMPLATES = [
  "I have a question about my prescription",
  "Can you explain my test results?",
  "I need to schedule a follow-up",
  "I'm experiencing side effects",
] as const;

export function formatMessageTime(sentAt: string) {
  return new Date(sentAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatThreadPreviewTime(sentAt: string) {
  const date = new Date(sentAt);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
