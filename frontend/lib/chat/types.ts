export type ChatSender = "provider" | "patient";

export type MessageType = "text" | "image" | "voice" | "document";

export type ChatMediaMessageType = Extract<MessageType, "image" | "voice" | "document">;

export type ThreadMessage = {
  id: string;
  sender: ChatSender;
  senderName: string;
  content: string;
  sentAt: string;
  messageType: MessageType;
  mediaUrl?: string | null;
  mediaMime?: string | null;
  mediaDurationMs?: number | null;
  pending?: boolean;
};

export type ChatThread = {
  conversationId: string;
  patientId: string;
  patientName: string;
  providerName: string;
  providerSpecialty: string;
  providerOnline: boolean;
  messages: ThreadMessage[];
  unreadProvider: number;
  unreadPatient: number;
};

export type ApiMessage = {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  sender_role: string;
  message_type: MessageType;
  content?: string | null;
  media_url?: string | null;
  media_mime?: string | null;
  media_duration_ms?: number | null;
  sender_name?: string | null;
  created_at: string;
};

export type ApiConversation = {
  id: string;
  doctor_id: string;
  clinic_id: string;
  patient_id: string;
  status: string;
  last_message_at?: string | null;
  patient_name?: string | null;
  doctor_name?: string | null;
  doctor_email?: string | null;
  unread_provider?: number;
  unread_patient?: number;
  last_message_preview?: string | null;
};

export type ApiTemplate = {
  id: string;
  label: string;
  content: string;
  role: string;
};

export const CHAT_MAX_CHARS = 2000;

export const PATIENT_QUICK_TEMPLATES = [
  "I have a question about my prescription",
  "Can you explain my test results?",
  "I need to schedule a follow-up",
  "I'm experiencing side effects",
] as const;

export function apiMessageToThreadMessage(message: ApiMessage): ThreadMessage {
  return {
    id: message.id,
    sender: message.sender_role === "patient" ? "patient" : "provider",
    senderName: message.sender_name ?? (message.sender_role === "patient" ? "Patient" : "Physician"),
    content:
      message.content ??
      (message.message_type === "image"
        ? "Image"
        : message.message_type === "document"
          ? "Document"
          : "Voice message"),
    sentAt: message.created_at,
    messageType: message.message_type,
    mediaUrl: message.media_url,
    mediaMime: message.media_mime,
    mediaDurationMs: message.media_duration_ms,
    pending: false,
  };
}

export function mergeThreadMessage(messages: ThreadMessage[], incoming: ThreadMessage): ThreadMessage[] {
  if (messages.some((message) => message.id === incoming.id)) {
    return messages;
  }

  const pendingIndex = messages.findIndex(
    (message) =>
      message.pending &&
      message.sender === incoming.sender &&
      message.messageType === incoming.messageType &&
      (message.content === incoming.content ||
        (message.messageType !== "text" && incoming.messageType !== "text")),
  );

  if (pendingIndex >= 0) {
    const next = [...messages];
    next[pendingIndex] = { ...incoming, pending: false };
    return next;
  }

  return [...messages, incoming];
}

export function replacePendingMessage(
  messages: ThreadMessage[],
  tempId: string,
  incoming: ThreadMessage,
): ThreadMessage[] {
  const pendingIndex = messages.findIndex((message) => message.id === tempId);
  if (pendingIndex >= 0) {
    const next = [...messages];
    next[pendingIndex] = { ...incoming, pending: false };
    return next;
  }
  return mergeThreadMessage(messages, incoming);
}

export function apiConversationToThread(
  conversation: ApiConversation,
  messages: ThreadMessage[] = [],
): ChatThread {
  return {
    conversationId: conversation.id,
    patientId: conversation.patient_id,
    patientName: conversation.patient_name ?? "Patient",
    providerName: conversation.doctor_name ?? "Physician",
    providerSpecialty: "Integrative Medicine",
    providerOnline: true,
    messages,
    unreadProvider: conversation.unread_provider ?? 0,
    unreadPatient: conversation.unread_patient ?? 0,
  };
}

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

export function formatDuration(ms?: number | null) {
  if (!ms) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
