export type ChatSender = "provider" | "patient";

export type MessageType = "text" | "image" | "voice" | "document";

export type ChatMediaMessageType = Extract<MessageType, "image" | "voice" | "document">;

export type MessageReaction = {
  emoji: string;
  user_id: string;
  user_name?: string | null;
};

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
  replyToMessageId?: string | null;
  reactions?: MessageReaction[];
  pending?: boolean;
};

export type ReplyTarget = {
  id: string;
  senderName: string;
  preview: string;
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
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  /** First page fetched for this thread. */
  messagesLoaded?: boolean;
  /** More older messages exist on the server. */
  hasMoreMessages?: boolean;
  /** Initial message page loading. */
  messagesLoading?: boolean;
  /** Older page loading (scroll up). */
  messagesLoadingMore?: boolean;
};

export type ApiMessage = {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  sender_role: string;
  message_type: MessageType;
  content?: string | null;
  media_key?: string | null;
  media_url?: string | null;
  media_mime?: string | null;
  media_duration_ms?: number | null;
  sender_name?: string | null;
  reply_to_message_id?: string | null;
  reactions?: MessageReaction[];
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

export function filterTemplatesForRole(templates: ApiTemplate[], viewerRole: ChatSender): ApiTemplate[] {
  const roleKey = viewerRole === "patient" ? "patient" : "provider";
  return templates.filter(
    (template) => template.role === roleKey || template.role === "both" || template.role === "all",
  );
}

export function fallbackQuickTemplates(viewerRole: ChatSender): ApiTemplate[] {
  if (viewerRole !== "patient") return [];
  return PATIENT_QUICK_TEMPLATES.map((content, index) => ({
    id: `fallback-${index}`,
    label: content.length > 36 ? `${content.slice(0, 33)}…` : content,
    content,
    role: "patient",
  }));
}

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
    replyToMessageId: message.reply_to_message_id,
    reactions: message.reactions ?? [],
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

export function updateThreadMessage(
  messages: ThreadMessage[],
  incoming: ThreadMessage,
): ThreadMessage[] {
  const index = messages.findIndex((message) => message.id === incoming.id);
  if (index < 0) return messages;
  const next = [...messages];
  next[index] = incoming;
  return next;
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
    lastMessagePreview: conversation.last_message_preview ?? null,
    lastMessageAt: conversation.last_message_at ?? null,
  };
}

export function sortMessagesChronologically(messages: ThreadMessage[]): ThreadMessage[] {
  return [...messages].sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
  );
}

export function formatChatDateLabel(sentAt: string) {
  const date = new Date(sentAt);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMessageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfMessageDay.getTime()) / 86_400_000,
  );

  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type MessageDateGroup = {
  dateKey: string;
  label: string;
  messages: ThreadMessage[];
};

export function groupMessagesByDate(messages: ThreadMessage[]): MessageDateGroup[] {
  const sorted = sortMessagesChronologically(messages);
  const groups: MessageDateGroup[] = [];

  for (const message of sorted) {
    const dateKey = new Date(message.sentAt).toDateString();
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.dateKey === dateKey) {
      lastGroup.messages.push(message);
    } else {
      groups.push({
        dateKey,
        label: formatChatDateLabel(message.sentAt),
        messages: [message],
      });
    }
  }

  return groups;
}

export function getThreadLastMessage(thread: ChatThread): ThreadMessage | undefined {
  if (thread.messages.length === 0) return undefined;
  return sortMessagesChronologically(thread.messages).at(-1);
}

export function getThreadLastActivityAt(thread: ChatThread): string | null {
  const lastMessage = getThreadLastMessage(thread);
  return lastMessage?.sentAt ?? thread.lastMessageAt ?? null;
}

export function messagePreviewText(message: Pick<ThreadMessage, "messageType" | "content">) {
  if (message.messageType === "image") {
    return message.content && message.content !== "Image" ? message.content : "Photo";
  }
  if (message.messageType === "voice") return "Voice message";
  if (message.messageType === "document") return message.content || "Document";
  return message.content;
}

export function getThreadPreviewText(thread: ChatThread, viewerRole: ChatSender) {
  const last = getThreadLastMessage(thread);
  if (last) {
    const prefix = last.sender === viewerRole ? "You: " : "";
    return `${prefix}${messagePreviewText(last)}`;
  }
  if (thread.lastMessagePreview) return thread.lastMessagePreview;
  return "No messages yet";
}

export function formatBubbleTime(sentAt: string) {
  return new Date(sentAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
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
