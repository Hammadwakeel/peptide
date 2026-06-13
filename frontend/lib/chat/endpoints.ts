export const COMMUNICATION_API_URL =
  process.env.NEXT_PUBLIC_COMMUNICATION_API_URL ??
  process.env.NEXT_PUBLIC_API_COMMUNICATION_URL ??
  "http://127.0.0.1:3003";

export const COMMUNICATION_WS_URL =
  process.env.NEXT_PUBLIC_COMMUNICATION_WS_URL ??
  COMMUNICATION_API_URL.replace(/^http/, "ws");

export const CHAT_ENDPOINTS = {
  conversations: `${COMMUNICATION_API_URL}/conversations`,
  myConversation: `${COMMUNICATION_API_URL}/conversations/me`,
  messages: (conversationId: string) =>
    `${COMMUNICATION_API_URL}/conversations/${conversationId}/messages`,
  upload: (conversationId: string) =>
    `${COMMUNICATION_API_URL}/conversations/${conversationId}/messages/upload`,
  reaction: (conversationId: string, messageId: string) =>
    `${COMMUNICATION_API_URL}/conversations/${conversationId}/messages/${messageId}/reactions`,
  markRead: (conversationId: string) =>
    `${COMMUNICATION_API_URL}/conversations/${conversationId}/read`,
  templates: `${COMMUNICATION_API_URL}/message-templates`,
  ws: `${COMMUNICATION_WS_URL}/ws/chat`,
} as const;
