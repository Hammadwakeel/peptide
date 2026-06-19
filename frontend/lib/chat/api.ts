import {
  isTokenExpired,
  refreshAuthSession,
  shouldRefreshToken,
} from "@/lib/auth/api";
import { readRememberMe, readSession, persistSession } from "@/lib/auth/storage";
import { CHAT_ENDPOINTS } from "@/lib/chat/endpoints";
import type { ApiConversation, ApiMessage, ApiTemplate } from "@/lib/chat/types";

async function getAccessToken(): Promise<string> {
  let session = readSession();
  if (!session) {
    throw new Error("Not authenticated.");
  }

  if (isTokenExpired(session.refreshExpiresAt)) {
    throw new Error("Session expired. Please sign in again.");
  }

  if (shouldRefreshToken(session.expiresAt) || isTokenExpired(session.expiresAt)) {
    session = await refreshAuthSession(session);
    persistSession(session, readRememberMe());
  }

  return session.accessToken;
}

function parseApiError(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as { detail?: unknown; message?: unknown };
  if (typeof record.detail === "string") return record.detail;
  if (Array.isArray(record.detail) && record.detail[0]?.msg) {
    return String(record.detail[0].msg);
  }
  if (typeof record.message === "string") return record.message;
  return fallback;
}

async function chatFetch<T>(input: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const isFormData = options.body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(input, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Unable to reach the chat service. Make sure the communication service is running on port 3003.",
    );
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(parseApiError(payload, response.statusText || "Request failed"));
  }
  return payload as T;
}

export async function createConversation(patientId: string): Promise<ApiConversation> {
  return chatFetch<ApiConversation>(CHAT_ENDPOINTS.conversations, {
    method: "POST",
    body: JSON.stringify({ patient_id: patientId }),
  });
}

export async function listConversations(): Promise<ApiConversation[]> {
  const limit = 50;
  let page = 1;
  const conversations: ApiConversation[] = [];

  while (true) {
    const data = await chatFetch<{
      conversations: ApiConversation[];
      pagination?: { has_next?: boolean };
    }>(`${CHAT_ENDPOINTS.conversations}?page=${page}&limit=${limit}`);
    conversations.push(...(data.conversations ?? []));
    if (!data.pagination?.has_next) break;
    page += 1;
  }

  return conversations;
}

export async function getMyConversation(): Promise<ApiConversation> {
  return chatFetch<ApiConversation>(CHAT_ENDPOINTS.myConversation);
}

export async function listMessages(
  conversationId: string,
  options?: { limit?: number; beforeId?: string },
): Promise<{ messages: ApiMessage[]; hasMore: boolean }> {
  const params = new URLSearchParams();
  if (options?.limit != null) params.set("limit", String(options.limit));
  if (options?.beforeId) params.set("before_id", options.beforeId);
  const query = params.toString();
  const url = query
    ? `${CHAT_ENDPOINTS.messages(conversationId)}?${query}`
    : CHAT_ENDPOINTS.messages(conversationId);
  const data = await chatFetch<{ messages: ApiMessage[]; has_more?: boolean }>(url);
  return {
    messages: data.messages ?? [],
    hasMore: Boolean(data.has_more),
  };
}

export async function sendTextMessage(
  conversationId: string,
  content: string,
  options?: { replyToMessageId?: string },
): Promise<ApiMessage> {
  return chatFetch<ApiMessage>(CHAT_ENDPOINTS.messages(conversationId), {
    method: "POST",
    body: JSON.stringify({
      content,
      reply_to_message_id: options?.replyToMessageId ?? null,
    }),
  });
}

export async function uploadChatMedia(
  conversationId: string,
  file: File,
  messageType: "image" | "voice" | "document",
  options?: { content?: string; mediaDurationMs?: number; replyToMessageId?: string },
): Promise<ApiMessage> {
  const formData = new FormData();
  formData.append("message_type", messageType);
  formData.append("file", file);
  if (options?.content) formData.append("content", options.content);
  if (options?.mediaDurationMs != null) {
    formData.append("media_duration_ms", String(options.mediaDurationMs));
  }
  if (options?.replyToMessageId) {
    formData.append("reply_to_message_id", options.replyToMessageId);
  }
  return chatFetch<ApiMessage>(CHAT_ENDPOINTS.upload(conversationId), {
    method: "POST",
    body: formData,
  });
}

export async function toggleMessageReaction(
  conversationId: string,
  messageId: string,
  emoji: string,
): Promise<ApiMessage> {
  return chatFetch<ApiMessage>(CHAT_ENDPOINTS.reaction(conversationId, messageId), {
    method: "POST",
    body: JSON.stringify({ emoji }),
  });
}

export async function markConversationRead(conversationId: string, role: "provider" | "patient") {
  return chatFetch(CHAT_ENDPOINTS.markRead(conversationId), {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}

export async function listMessageTemplates(): Promise<ApiTemplate[]> {
  const data = await chatFetch<{ templates: ApiTemplate[] }>(CHAT_ENDPOINTS.templates);
  return data.templates ?? [];
}

export async function getChatAccessToken(): Promise<string> {
  return getAccessToken();
}
