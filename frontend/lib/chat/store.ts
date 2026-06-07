import { INITIAL_CHAT_THREADS } from "@/lib/chat/mock-data";
import type { ChatSender, ChatThread, ThreadMessage } from "@/lib/chat/types";

const STORAGE_KEY = "frontier-chat-threads";

function readStore(): ChatThread[] {
  if (typeof window === "undefined") return INITIAL_CHAT_THREADS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatThread[]) : INITIAL_CHAT_THREADS;
  } catch {
    return INITIAL_CHAT_THREADS;
  }
}

function writeStore(threads: ChatThread[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  window.dispatchEvent(new Event("chat-updated"));
}

export function getChatThreads(): ChatThread[] {
  return readStore().map((thread) => ({
    ...thread,
    messages: [...thread.messages].sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
    ),
  }));
}

export function getChatThread(patientId: string): ChatThread | undefined {
  return getChatThreads().find((thread) => thread.patientId === patientId);
}

export function sendChatMessage(
  patientId: string,
  sender: ChatSender,
  senderName: string,
  content: string,
): ThreadMessage {
  const message: ThreadMessage = {
    id: `msg-${Date.now()}`,
    sender,
    senderName,
    content,
    sentAt: new Date().toISOString(),
  };

  const threads = readStore();
  const index = threads.findIndex((thread) => thread.patientId === patientId);

  if (index === -1) {
    writeStore(threads);
    return message;
  }

  const thread = threads[index];
  const updated: ChatThread = {
    ...thread,
    messages: [...thread.messages, message],
    unreadProvider: sender === "patient" ? thread.unreadProvider + 1 : thread.unreadProvider,
    unreadPatient: sender === "provider" ? thread.unreadPatient + 1 : thread.unreadPatient,
  };

  threads[index] = updated;
  writeStore(threads);
  return message;
}

export function markThreadRead(patientId: string, role: "provider" | "patient") {
  const threads = readStore();
  const index = threads.findIndex((thread) => thread.patientId === patientId);
  if (index === -1) return;

  threads[index] = {
    ...threads[index],
    unreadProvider: role === "provider" ? 0 : threads[index].unreadProvider,
    unreadPatient: role === "patient" ? 0 : threads[index].unreadPatient,
  };
  writeStore(threads);
}

export function getUnreadTotal(role: "provider" | "patient"): number {
  return getChatThreads().reduce(
    (sum, thread) =>
      sum + (role === "provider" ? thread.unreadProvider : thread.unreadPatient),
    0,
  );
}
