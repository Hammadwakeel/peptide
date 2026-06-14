"use client";

import { create } from "zustand";
import {
  getMyConversation,
  listConversations,
  listMessageTemplates,
  listMessages,
  markConversationRead,
  sendTextMessage,
  uploadChatMedia,
  toggleMessageReaction,
} from "@/lib/chat/api";
import {
  apiConversationToThread,
  apiMessageToThreadMessage,
  fallbackQuickTemplates,
  filterTemplatesForRole,
  mergeThreadMessage,
  messagePreviewText,
  replacePendingMessage,
  sortMessagesChronologically,
  updateThreadMessage,
  type ApiMessage,
  type ApiTemplate,
  type ChatSender,
  type ChatThread,
  type ChatMediaMessageType,
  type ThreadMessage,
} from "@/lib/chat/types";
import { createLocalPreviewUrl, revokePreviewUrl } from "@/lib/chat/preview";
import { CHAT_MESSAGES_PAGE_SIZE } from "@/lib/chat/constants";
import { readSession } from "@/lib/auth/storage";
import { chatSubscribe } from "@/lib/chat/ws-bridge";
import { showError } from "@/lib/toast";
import type { ChatWsEvent } from "@/lib/chat/ws";

function chatSenderFromSession(): ChatSender {
  const role = readSession()?.role;
  return role === "patient" ? "patient" : "provider";
}

function mergeConversationThreads(existing: ChatThread[], incoming: ChatThread[]): ChatThread[] {
  const byConversationId = new Map(existing.map((thread) => [thread.conversationId, thread]));
  return incoming.map((thread) => {
    const previous = byConversationId.get(thread.conversationId);
    if (!previous) return thread;
    return {
      ...thread,
      messages: previous.messages,
      messagesLoaded: previous.messagesLoaded,
      hasMoreMessages: previous.hasMoreMessages,
      messagesLoading: previous.messagesLoading,
      messagesLoadingMore: previous.messagesLoadingMore,
    };
  });
}

function dedupeMessages(messages: ThreadMessage[]): ThreadMessage[] {
  const seen = new Set<string>();
  return sortMessagesChronologically(messages).filter((message) => {
    if (seen.has(message.id)) return false;
    seen.add(message.id);
    return true;
  });
}

function oldestPersistedMessageId(messages: ThreadMessage[]): string | undefined {
  const sorted = sortMessagesChronologically(messages);
  for (const message of sorted) {
    if (!message.id.startsWith("pending-")) return message.id;
  }
  return undefined;
}

const messagesLoadInFlight = new Map<string, Promise<void>>();
const messagesLoadMoreInFlight = new Map<string, Promise<void>>();
const loadAllMessagesInFlight = new Map<string, Promise<void>>();

type ChatState = {
  threads: ChatThread[];
  messageTemplates: ApiTemplate[];
  templatesLoading: boolean;
  templatesLoaded: boolean;
  loading: boolean;
  error: string | null;
  isHydrated: boolean;
  refreshInFlight: Promise<void> | null;
  setThreads: (updater: ChatThread[] | ((current: ChatThread[]) => ChatThread[])) => void;
  applyWsEvent: (event: ChatWsEvent) => void;
  refreshThreads: (options?: { force?: boolean }) => Promise<void>;
  loadMessageTemplates: (options?: { force?: boolean }) => Promise<void>;
  getQuickTemplates: (role: ChatSender) => ApiTemplate[];
  reset: () => void;
  loadMessages: (conversationId: string) => Promise<void>;
  loadMoreMessages: (conversationId: string) => Promise<void>;
  loadAllMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, options?: { replyToMessageId?: string }) => Promise<void>;
  sendMedia: (
    conversationId: string,
    file: File,
    messageType: ChatMediaMessageType,
    options?: { content?: string; mediaDurationMs?: number; replyToMessageId?: string },
  ) => Promise<void>;
  toggleReaction: (conversationId: string, messageId: string, emoji: string) => Promise<void>;
  markRead: (conversationId: string, role: "provider" | "patient") => Promise<void>;
  ensureDoctorThread: (patientId: string) => Promise<ChatThread | undefined>;
  getThread: (patientId: string) => ChatThread | undefined;
  getThreadByConversationId: (conversationId: string) => ChatThread | undefined;
};

export const useChatStore = create<ChatState>((set, get) => ({
  threads: [],
  messageTemplates: [],
  templatesLoading: false,
  templatesLoaded: false,
  loading: true,
  error: null,
  isHydrated: false,
  refreshInFlight: null,

  reset: () =>
    set({
      threads: [],
      messageTemplates: [],
      templatesLoading: false,
      templatesLoaded: false,
      loading: true,
      error: null,
      isHydrated: false,
      refreshInFlight: null,
    }),

  setThreads: (updater) => {
    set((state) => ({
      threads: typeof updater === "function" ? updater(state.threads) : updater,
    }));
  },

  getThread: (patientId) => get().threads.find((thread) => thread.patientId === patientId),

  getThreadByConversationId: (conversationId) =>
    get().threads.find((thread) => thread.conversationId === conversationId),

  applyWsEvent: (event) => {
    if (event.type === "error" && typeof event.message === "string") {
      showError(new Error(event.message), event.message);
      return;
    }

    if (
      event.type === "message.new" &&
      event.conversation_id &&
      event.message &&
      typeof event.message === "object"
    ) {
      const message = apiMessageToThreadMessage(event.message as ApiMessage);
      let refreshUnknownThread = false;

      set((state) => {
        const hasThread = state.threads.some(
          (thread) => thread.conversationId === event.conversation_id,
        );
        if (!hasThread) {
          refreshUnknownThread = true;
          return state;
        }
        return {
          threads: state.threads.map((thread) =>
            thread.conversationId === event.conversation_id
              ? {
                  ...thread,
                  messages: mergeThreadMessage(thread.messages, message),
                  lastMessageAt: message.sentAt,
                  lastMessagePreview: messagePreviewText(message),
                  unreadProvider:
                    message.sender === "patient" ? thread.unreadProvider + 1 : thread.unreadProvider,
                  unreadPatient:
                    message.sender === "provider" ? thread.unreadPatient + 1 : thread.unreadPatient,
                }
              : thread,
          ),
        };
      });

      if (refreshUnknownThread) {
        queueMicrotask(() => {
          void get().refreshThreads({ force: true });
        });
      }
    }
    if (
      event.type === "message.updated" &&
      event.conversation_id &&
      event.message &&
      typeof event.message === "object"
    ) {
      const message = apiMessageToThreadMessage(event.message as ApiMessage);
      set((state) => ({
        threads: state.threads.map((thread) =>
          thread.conversationId === event.conversation_id
            ? { ...thread, messages: updateThreadMessage(thread.messages, message) }
            : thread,
        ),
      }));
    }
    if (event.type === "message.read" && event.conversation_id) {
      set((state) => ({
        threads: state.threads.map((thread) =>
          thread.conversationId === event.conversation_id
            ? {
                ...thread,
                unreadProvider:
                  event.role === "provider" ? 0 : thread.unreadProvider,
                unreadPatient: event.role === "patient" ? 0 : thread.unreadPatient,
              }
            : thread,
        ),
      }));
    }
  },

  refreshThreads: async (options = {}) => {
    const { force = false } = options;
    if (!force && get().isHydrated) return;
    if (get().refreshInFlight) return get().refreshInFlight!;

    const promise = (async () => {
      if (!get().isHydrated) set({ loading: true, error: null });
      try {
        let conversations;
        try {
          conversations = await listConversations();
        } catch {
          const mine = await getMyConversation();
          conversations = [mine];
        }

        const nextThreads = conversations.map((conversation) => apiConversationToThread(conversation));
        set((state) => ({
          threads: mergeConversationThreads(state.threads, nextThreads),
          isHydrated: true,
        }));
        for (const thread of nextThreads) {
          chatSubscribe(thread.conversationId);
        }

        const prefetchConversationId = nextThreads[0]?.conversationId;
        if (prefetchConversationId) {
          void get().loadMessages(prefetchConversationId);
        }
      } catch (err) {
        set({
          error: err instanceof Error ? err.message : "Failed to load conversations",
          threads: force ? [] : get().threads,
        });
      } finally {
        set({ loading: false, refreshInFlight: null });
      }
    })();

    set({ refreshInFlight: promise });
    return promise;
  },

  loadMessageTemplates: async (options = {}) => {
    const { force = false } = options;
    if (!force && get().templatesLoaded) return;

    set({ templatesLoading: true });
    try {
      const templates = await listMessageTemplates();
      set({ messageTemplates: templates, templatesLoaded: true });
    } catch {
      set({ messageTemplates: [], templatesLoaded: true });
    } finally {
      set({ templatesLoading: false });
    }
  },

  getQuickTemplates: (role) => {
    const filtered = filterTemplatesForRole(get().messageTemplates, role);
    if (filtered.length > 0) return filtered;
    return fallbackQuickTemplates(role);
  },

  loadMessages: async (conversationId) => {
    const existing = get().threads.find((thread) => thread.conversationId === conversationId);
    if (existing?.messagesLoaded) {
      chatSubscribe(conversationId);
      return;
    }
    if (messagesLoadInFlight.has(conversationId)) {
      return messagesLoadInFlight.get(conversationId)!;
    }

    const promise = (async () => {
      set((state) => ({
        threads: state.threads.map((thread) =>
          thread.conversationId === conversationId
            ? { ...thread, messagesLoading: true }
            : thread,
        ),
      }));

      try {
        const { messages, hasMore } = await listMessages(conversationId, {
          limit: CHAT_MESSAGES_PAGE_SIZE,
        });
        const mapped = sortMessagesChronologically(messages.map(apiMessageToThreadMessage));
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.conversationId === conversationId
              ? {
                  ...thread,
                  messages: mapped,
                  messagesLoaded: true,
                  hasMoreMessages: hasMore,
                  messagesLoading: false,
                  messagesLoadingMore: false,
                }
              : thread,
          ),
        }));
        chatSubscribe(conversationId);
      } catch {
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.conversationId === conversationId
              ? { ...thread, messagesLoading: false, messagesLoaded: false }
              : thread,
          ),
        }));
      } finally {
        messagesLoadInFlight.delete(conversationId);
      }
    })();

    messagesLoadInFlight.set(conversationId, promise);
    return promise;
  },

  loadMoreMessages: async (conversationId) => {
    const thread = get().threads.find((item) => item.conversationId === conversationId);
    if (!thread?.messagesLoaded || !thread.hasMoreMessages || thread.messagesLoadingMore) {
      return;
    }
    if (messagesLoadMoreInFlight.has(conversationId)) {
      return messagesLoadMoreInFlight.get(conversationId)!;
    }

    const beforeId = oldestPersistedMessageId(thread.messages);
    if (!beforeId) return;

    const promise = (async () => {
      set((state) => ({
        threads: state.threads.map((item) =>
          item.conversationId === conversationId
            ? { ...item, messagesLoadingMore: true }
            : item,
        ),
      }));

      try {
        const { messages, hasMore } = await listMessages(conversationId, {
          limit: CHAT_MESSAGES_PAGE_SIZE,
          beforeId,
        });
        const mapped = messages.map(apiMessageToThreadMessage);
        set((state) => ({
          threads: state.threads.map((item) =>
            item.conversationId === conversationId
              ? {
                  ...item,
                  messages: dedupeMessages([...mapped, ...item.messages]),
                  hasMoreMessages: hasMore,
                  messagesLoadingMore: false,
                }
              : item,
          ),
        }));
      } catch {
        set((state) => ({
          threads: state.threads.map((item) =>
            item.conversationId === conversationId
              ? { ...item, messagesLoadingMore: false }
              : item,
          ),
        }));
      } finally {
        messagesLoadMoreInFlight.delete(conversationId);
      }
    })();

    messagesLoadMoreInFlight.set(conversationId, promise);
    return promise;
  },

  loadAllMessages: async (conversationId) => {
    if (loadAllMessagesInFlight.has(conversationId)) {
      return loadAllMessagesInFlight.get(conversationId)!;
    }

    const promise = (async () => {
      await get().loadMessages(conversationId);
      for (let page = 0; page < 200; page += 1) {
        const thread = get().threads.find((item) => item.conversationId === conversationId);
        if (!thread?.hasMoreMessages) break;
        await get().loadMoreMessages(conversationId);
      }
    })();

    loadAllMessagesInFlight.set(conversationId, promise);
    try {
      await promise;
    } finally {
      loadAllMessagesInFlight.delete(conversationId);
    }
  },

  sendMessage: async (conversationId, content, options) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const sender = chatSenderFromSession();
    const thread = get().threads.find((item) => item.conversationId === conversationId);
    const tempId = `pending-${crypto.randomUUID()}`;
    const optimistic: ThreadMessage = {
      id: tempId,
      sender,
      senderName:
        sender === "provider" ? (thread?.providerName ?? "You") : (thread?.patientName ?? "You"),
      content: trimmed,
      sentAt: new Date().toISOString(),
      messageType: "text",
      replyToMessageId: options?.replyToMessageId ?? null,
      reactions: [],
      pending: true,
    };

    set((state) => ({
      threads: state.threads.map((item) =>
        item.conversationId === conversationId
          ? { ...item, messages: [...item.messages, optimistic] }
          : item,
      ),
    }));

    try {
      const message = await sendTextMessage(conversationId, trimmed, {
        replyToMessageId: options?.replyToMessageId,
      });
      const mapped = apiMessageToThreadMessage(message);
      set((state) => ({
        threads: state.threads.map((item) => {
          if (item.conversationId !== conversationId) return item;
          const withoutPending = item.messages.filter((m) => m.id !== tempId);
          return { ...item, messages: mergeThreadMessage(withoutPending, mapped), lastMessageAt: mapped.sentAt, lastMessagePreview: messagePreviewText(mapped) };
        }),
      }));
    } catch (err) {
      set((state) => ({
        threads: state.threads.map((item) =>
          item.conversationId === conversationId
            ? { ...item, messages: item.messages.filter((m) => m.id !== tempId) }
            : item,
        ),
      }));
      throw err;
    }
  },

  sendMedia: async (conversationId, file, messageType, options) => {
    const sender = chatSenderFromSession();
    const thread = get().threads.find((item) => item.conversationId === conversationId);
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
      replyToMessageId: options?.replyToMessageId ?? null,
      reactions: [],
      pending: true,
    };

    set((state) => ({
      threads: state.threads.map((item) =>
        item.conversationId === conversationId
          ? { ...item, messages: [...item.messages, optimistic] }
          : item,
      ),
    }));

    let localPreviewUrl = "";
    try {
      localPreviewUrl = await createLocalPreviewUrl(file, messageType);
      if (localPreviewUrl) {
        set((state) => ({
          threads: state.threads.map((item) =>
            item.conversationId === conversationId
              ? {
                  ...item,
                  messages: item.messages.map((message) =>
                    message.id === tempId ? { ...message, mediaUrl: localPreviewUrl } : message,
                  ),
                }
              : item,
          ),
        }));
      }
    } catch {
      localPreviewUrl = "";
    }

    try {
      const message = await uploadChatMedia(conversationId, file, messageType, options);
      const mapped = apiMessageToThreadMessage(message);
      set((state) => ({
        threads: state.threads.map((item) => {
          if (item.conversationId !== conversationId) return item;
          return {
            ...item,
            messages: replacePendingMessage(item.messages, tempId, mapped),
          };
        }),
      }));
    } catch (err) {
      set((state) => ({
        threads: state.threads.map((item) =>
          item.conversationId === conversationId
            ? { ...item, messages: item.messages.filter((m) => m.id !== tempId) }
            : item,
        ),
      }));
      throw err;
    } finally {
      if (localPreviewUrl) {
        revokePreviewUrl(localPreviewUrl);
      }
    }
  },

  toggleReaction: async (conversationId, messageId, emoji) => {
    const message = await toggleMessageReaction(conversationId, messageId, emoji);
    const mapped = apiMessageToThreadMessage(message);
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.conversationId === conversationId
          ? { ...thread, messages: updateThreadMessage(thread.messages, mapped) }
          : thread,
      ),
    }));
  },

  markRead: async (conversationId, role) => {
    await markConversationRead(conversationId, role);
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.conversationId === conversationId
          ? {
              ...thread,
              unreadProvider: role === "provider" ? 0 : thread.unreadProvider,
              unreadPatient: role === "patient" ? 0 : thread.unreadPatient,
            }
          : thread,
      ),
    }));
  },

  ensureDoctorThread: async (patientId) => {
    const existing = get().threads.find((thread) => thread.patientId === patientId);
    if (existing) return existing;
    const { createConversation } = await import("@/lib/chat/api");
    const conversation = await createConversation(patientId);
    const thread = apiConversationToThread(conversation);
    set((state) => {
      if (state.threads.some((item) => item.conversationId === thread.conversationId)) {
        return state;
      }
      return { threads: [...state.threads, thread] };
    });
    chatSubscribe(thread.conversationId);
    return thread;
  },
}));
