"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { ChatWebSocketClient, type ChatWsEvent } from "@/lib/chat/ws";
import { setChatSubscribeHandler } from "@/lib/chat/ws-bridge";
import { useShallow } from "@/lib/hooks/zustand";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";
import type { ChatSender } from "@/lib/chat/types";

export function ChatProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<ChatWebSocketClient | null>(null);
  const { session, isLoading } = useAuthStore(
    useShallow((state) => ({
      session: state.session,
      isLoading: state.isLoading,
    })),
  );

  const subscribeConversation = useCallback((conversationId: string) => {
    if (!conversationId) return;
    wsRef.current?.subscribe(conversationId);
  }, []);

  const subscribeAllThreads = useCallback(() => {
    for (const thread of useChatStore.getState().threads) {
      wsRef.current?.subscribe(thread.conversationId);
    }
  }, []);

  useEffect(() => {
    setChatSubscribeHandler(subscribeConversation);
    return () => setChatSubscribeHandler(() => {});
  }, [subscribeConversation]);

  useEffect(() => {
    return useChatStore.subscribe((state, prev) => {
      if (state.threads !== prev.threads) {
        subscribeAllThreads();
      }
    });
  }, [subscribeAllThreads]);

  useEffect(() => {
    if (isLoading || !session) return;

    const client = new ChatWebSocketClient();
    wsRef.current = client;
    const applyWsEvent = (event: ChatWsEvent) => useChatStore.getState().applyWsEvent(event);

    void client.connect({
      onEvent: applyWsEvent,
      onOpen: () => subscribeAllThreads(),
      onReady: () => subscribeAllThreads(),
    }).catch(() => {
      // Auth may have expired between render and connect; guard will redirect.
    });

    void useChatStore.getState().loadMessageTemplates();

    return () => {
      client.disconnect();
      wsRef.current = null;
    };
  }, [isLoading, session, subscribeAllThreads]);

  return children;
}

export function useProviderUnreadTotal() {
  return useChatStore((state) =>
    state.threads.reduce((sum, thread) => sum + thread.unreadProvider, 0),
  );
}

export function usePatientUnreadTotal() {
  return useChatStore((state) =>
    state.threads.reduce((sum, thread) => sum + thread.unreadPatient, 0),
  );
}

export function useChat() {
  return useChatStore(
    useShallow((state) => ({
      threads: state.threads,
      loading: state.loading,
      error: state.error,
      providerUnreadTotal: state.threads.reduce((sum, thread) => sum + thread.unreadProvider, 0),
      patientUnreadTotal: state.threads.reduce((sum, thread) => sum + thread.unreadPatient, 0),
      templatesLoading: state.templatesLoading,
      getQuickTemplates: state.getQuickTemplates,
      getThread: state.getThread,
      getThreadByConversationId: state.getThreadByConversationId,
      refreshThreads: state.refreshThreads,
      loadMessages: state.loadMessages,
      loadMoreMessages: state.loadMoreMessages,
      loadAllMessages: state.loadAllMessages,
      sendMessage: state.sendMessage,
      sendMedia: state.sendMedia,
      toggleReaction: state.toggleReaction,
      markRead: state.markRead,
      ensureDoctorThread: state.ensureDoctorThread,
    })),
  );
}

export type { ChatSender };
