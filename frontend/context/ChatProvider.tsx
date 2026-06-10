"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getMyConversation,
  listConversations,
  listMessages,
  markConversationRead,
  sendTextMessage,
  uploadChatMedia,
} from "@/lib/chat/api";
import {
  apiConversationToThread,
  apiMessageToThreadMessage,
  mergeThreadMessage,
  replacePendingMessage,
  type ApiMessage,
  type ChatSender,
  type ChatThread,
  type ChatMediaMessageType,
  type ThreadMessage,
} from "@/lib/chat/types";
import { createLocalPreviewUrl, revokePreviewUrl } from "@/lib/chat/preview";
import { readSession } from "@/lib/auth/storage";
import { ChatWebSocketClient, type ChatWsEvent } from "@/lib/chat/ws";

type ChatContextValue = {
  threads: ChatThread[];
  loading: boolean;
  error: string | null;
  providerUnreadTotal: number;
  patientUnreadTotal: number;
  getThread: (patientId: string) => ChatThread | undefined;
  getThreadByConversationId: (conversationId: string) => ChatThread | undefined;
  refreshThreads: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  sendMedia: (
    conversationId: string,
    file: File,
    messageType: ChatMediaMessageType,
    options?: { content?: string; mediaDurationMs?: number },
  ) => Promise<void>;
  markRead: (conversationId: string, role: "provider" | "patient") => Promise<void>;
  ensureDoctorThread: (patientId: string) => Promise<ChatThread | undefined>;
};

const ChatContext = createContext<ChatContextValue | null>(null);

function chatSenderFromSession(): ChatSender {
  const role = readSession()?.role;
  return role === "patient" ? "patient" : "provider";
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<ChatWebSocketClient | null>(null);
  const threadsRef = useRef<ChatThread[]>([]);
  const refreshThreadsRef = useRef<() => Promise<void>>(async () => {});
  const applyWsEventRef = useRef<(event: ChatWsEvent) => void>(() => {});
  const subscribeAllThreadsRef = useRef<() => void>(() => {});
  threadsRef.current = threads;

  const applyWsEvent = useCallback((event: ChatWsEvent) => {
    if (event.type === "message.new" && event.conversation_id && event.message) {
      const message = apiMessageToThreadMessage(event.message as ApiMessage);
      setThreads((current) => {
        const hasThread = current.some((thread) => thread.conversationId === event.conversation_id);
        if (!hasThread) {
          void refreshThreadsRef.current();
          return current;
        }
        return current.map((thread) =>
          thread.conversationId === event.conversation_id
            ? {
                ...thread,
                messages: mergeThreadMessage(thread.messages, message),
                unreadProvider:
                  message.sender === "patient" ? thread.unreadProvider + 1 : thread.unreadProvider,
                unreadPatient:
                  message.sender === "provider" ? thread.unreadPatient + 1 : thread.unreadPatient,
              }
            : thread,
        );
      });
    }
    if (event.type === "message.read" && event.conversation_id) {
      setThreads((current) =>
        current.map((thread) =>
          thread.conversationId === event.conversation_id
            ? {
                ...thread,
                unreadProvider: event.role === "provider" ? 0 : thread.unreadProvider,
                unreadPatient: event.role === "patient" ? 0 : thread.unreadPatient,
              }
            : thread,
        ),
      );
    }
  }, []);

  applyWsEventRef.current = applyWsEvent;

  const subscribeConversation = useCallback((conversationId: string) => {
    if (!conversationId) return;
    wsRef.current?.subscribe(conversationId);
  }, []);

  const subscribeAllThreads = useCallback(() => {
    for (const thread of threadsRef.current) {
      wsRef.current?.subscribe(thread.conversationId);
    }
  }, []);

  subscribeAllThreadsRef.current = subscribeAllThreads;

  const refreshThreads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let conversations;
      try {
        conversations = await listConversations();
      } catch {
        const mine = await getMyConversation();
        conversations = [mine];
      }

      const nextThreads = conversations.map((conversation) => apiConversationToThread(conversation));
      setThreads(nextThreads);
      for (const thread of nextThreads) {
        subscribeConversation(thread.conversationId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations");
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [subscribeConversation]);

  refreshThreadsRef.current = refreshThreads;

  const loadMessages = useCallback(async (conversationId: string) => {
    const messages = await listMessages(conversationId);
    setThreads((current) =>
      current.map((thread) =>
        thread.conversationId === conversationId
          ? { ...thread, messages: messages.map(apiMessageToThreadMessage) }
          : thread,
      ),
    );
    subscribeConversation(conversationId);
  }, [subscribeConversation]);

  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const sender = chatSenderFromSession();
    const thread = threadsRef.current.find((item) => item.conversationId === conversationId);
    const tempId = `pending-${crypto.randomUUID()}`;
    const optimistic: ThreadMessage = {
      id: tempId,
      sender,
      senderName:
        sender === "provider" ? (thread?.providerName ?? "You") : (thread?.patientName ?? "You"),
      content: trimmed,
      sentAt: new Date().toISOString(),
      messageType: "text",
      pending: true,
    };

    setThreads((current) =>
      current.map((item) =>
        item.conversationId === conversationId
          ? { ...item, messages: [...item.messages, optimistic] }
          : item,
      ),
    );

    try {
      const message = await sendTextMessage(conversationId, trimmed);
      const mapped = apiMessageToThreadMessage(message);
      setThreads((current) =>
        current.map((item) => {
          if (item.conversationId !== conversationId) return item;
          const withoutPending = item.messages.filter((m) => m.id !== tempId);
          return { ...item, messages: mergeThreadMessage(withoutPending, mapped) };
        }),
      );
    } catch (err) {
      setThreads((current) =>
        current.map((item) =>
          item.conversationId === conversationId
            ? { ...item, messages: item.messages.filter((m) => m.id !== tempId) }
            : item,
        ),
      );
      throw err;
    }
  }, []);

  const sendMedia = useCallback(
    async (
      conversationId: string,
      file: File,
      messageType: ChatMediaMessageType,
      options?: { content?: string; mediaDurationMs?: number },
    ) => {
      const sender = chatSenderFromSession();
      const thread = threadsRef.current.find((item) => item.conversationId === conversationId);
      const tempId = `pending-${crypto.randomUUID()}`;
      const caption =
        options?.content ??
        (messageType === "image" ? "Image" : messageType === "document" ? file.name : "Voice message");

      const optimistic: ThreadMessage = {
        id: tempId,
        sender,
        senderName:
          sender === "provider" ? (thread?.providerName ?? "You") : (thread?.patientName ?? "You"),
        content: caption,
        sentAt: new Date().toISOString(),
        messageType,
        mediaUrl: null,
        mediaMime: file.type || null,
        mediaDurationMs: options?.mediaDurationMs ?? null,
        pending: true,
      };

      setThreads((current) =>
        current.map((item) =>
          item.conversationId === conversationId
            ? { ...item, messages: [...item.messages, optimistic] }
            : item,
        ),
      );

      let localPreviewUrl = "";
      try {
        localPreviewUrl = await createLocalPreviewUrl(file, messageType);
        if (localPreviewUrl) {
          setThreads((current) =>
            current.map((item) =>
              item.conversationId === conversationId
                ? {
                    ...item,
                    messages: item.messages.map((message) =>
                      message.id === tempId
                        ? { ...message, mediaUrl: localPreviewUrl }
                        : message,
                    ),
                  }
                : item,
            ),
          );
        }
      } catch {
        localPreviewUrl = "";
      }

      try {
        const message = await uploadChatMedia(conversationId, file, messageType, options);
        const mapped = apiMessageToThreadMessage(message);
        setThreads((current) =>
          current.map((item) => {
            if (item.conversationId !== conversationId) return item;
            return {
              ...item,
              messages: replacePendingMessage(item.messages, tempId, mapped),
            };
          }),
        );
      } catch (err) {
        setThreads((current) =>
          current.map((item) =>
            item.conversationId === conversationId
              ? { ...item, messages: item.messages.filter((m) => m.id !== tempId) }
              : item,
          ),
        );
        throw err;
      } finally {
        if (localPreviewUrl) {
          revokePreviewUrl(localPreviewUrl);
        }
      }
    },
    [],
  );

  const markRead = useCallback(async (conversationId: string, role: "provider" | "patient") => {
    await markConversationRead(conversationId, role);
    setThreads((current) =>
      current.map((thread) =>
        thread.conversationId === conversationId
          ? {
              ...thread,
              unreadProvider: role === "provider" ? 0 : thread.unreadProvider,
              unreadPatient: role === "patient" ? 0 : thread.unreadPatient,
            }
          : thread,
      ),
    );
  }, []);

  const ensureDoctorThread = useCallback(
    async (patientId: string) => {
      const existing = threads.find((thread) => thread.patientId === patientId);
      if (existing) return existing;
      const { createConversation } = await import("@/lib/chat/api");
      const conversation = await createConversation(patientId);
      const thread = apiConversationToThread(conversation);
      setThreads((current) => {
        if (current.some((item) => item.conversationId === thread.conversationId)) {
          return current;
        }
        return [...current, thread];
      });
      subscribeConversation(thread.conversationId);
      return thread;
    },
    [threads, subscribeConversation],
  );

  useEffect(() => {
    void refreshThreads();
  }, [refreshThreads]);

  useEffect(() => {
    subscribeAllThreads();
  }, [threads, subscribeAllThreads]);

  useEffect(() => {
    const client = new ChatWebSocketClient();
    wsRef.current = client;
    void client.connect({
      onEvent: (event) => applyWsEventRef.current(event),
      onOpen: () => subscribeAllThreadsRef.current(),
    });
    return () => {
      client.disconnect();
      wsRef.current = null;
    };
  }, []);

  const value = useMemo(
    () => ({
      threads,
      loading,
      error,
      providerUnreadTotal: threads.reduce((sum, thread) => sum + thread.unreadProvider, 0),
      patientUnreadTotal: threads.reduce((sum, thread) => sum + thread.unreadPatient, 0),
      getThread: (patientId: string) => threads.find((thread) => thread.patientId === patientId),
      getThreadByConversationId: (conversationId: string) =>
        threads.find((thread) => thread.conversationId === conversationId),
      refreshThreads,
      loadMessages,
      sendMessage,
      sendMedia,
      markRead,
      ensureDoctorThread,
    }),
    [
      threads,
      loading,
      error,
      refreshThreads,
      loadMessages,
      sendMessage,
      sendMedia,
      markRead,
      ensureDoctorThread,
    ],
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

export type { ChatSender };
