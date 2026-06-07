"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_PATIENT_THREAD_ID } from "@/lib/chat/mock-data";
import {
  getChatThreads,
  getUnreadTotal,
  markThreadRead,
  sendChatMessage,
} from "@/lib/chat/store";
import type { ChatSender, ChatThread } from "@/lib/chat/types";

type ChatContextValue = {
  threads: ChatThread[];
  providerUnreadTotal: number;
  patientUnreadTotal: number;
  getThread: (patientId: string) => ChatThread | undefined;
  sendMessage: (patientId: string, sender: ChatSender, senderName: string, content: string) => void;
  markRead: (patientId: string, role: "provider" | "patient") => void;
  defaultPatientId: string;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<ChatThread[]>(() => getChatThreads());

  const refresh = useCallback(() => {
    setThreads(getChatThreads());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("chat-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("chat-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const sendMessage = useCallback(
    (patientId: string, sender: ChatSender, senderName: string, content: string) => {
      sendChatMessage(patientId, sender, senderName, content);
      refresh();
    },
    [refresh],
  );

  const markRead = useCallback(
    (patientId: string, role: "provider" | "patient") => {
      markThreadRead(patientId, role);
      refresh();
    },
    [refresh],
  );

  const value = useMemo(
    () => ({
      threads,
      providerUnreadTotal: getUnreadTotal("provider"),
      patientUnreadTotal: getUnreadTotal("patient"),
      getThread: (patientId: string) => threads.find((thread) => thread.patientId === patientId),
      sendMessage,
      markRead,
      defaultPatientId: DEFAULT_PATIENT_THREAD_ID,
    }),
    [threads, sendMessage, markRead],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
