import { CHAT_ENDPOINTS } from "@/lib/chat/endpoints";
import { getChatAccessToken } from "@/lib/chat/api";

export type ChatWsEvent = {
  type: string;
  conversation_id?: string;
  message?: Record<string, unknown>;
  role?: string;
  read_at?: string;
};

type ChatWsHandlers = {
  onEvent: (event: ChatWsEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

export class ChatWebSocketClient {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private subscriptions = new Set<string>();
  private handlers: ChatWsHandlers | null = null;
  private closedByUser = false;

  async connect(handlers: ChatWsHandlers) {
    this.handlers = handlers;
    this.closedByUser = false;
    if (
      this.socket?.readyState === WebSocket.OPEN ||
      this.socket?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }
    const token = await getChatAccessToken();
    const url = `${CHAT_ENDPOINTS.ws}?token=${encodeURIComponent(token)}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.handlers?.onOpen?.();
      for (const conversationId of this.subscriptions) {
        this.sendSubscribe(conversationId);
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(String(event.data)) as ChatWsEvent;
        this.handlers?.onEvent(payload);
      } catch {
        // ignore malformed payloads
      }
    };

    this.socket.onclose = () => {
      this.handlers?.onClose?.();
      if (!this.closedByUser) {
        this.scheduleReconnect();
      }
    };
  }

  subscribe(conversationId: string) {
    this.subscriptions.add(conversationId);
    this.sendSubscribe(conversationId);
  }

  unsubscribe(conversationId: string) {
    this.subscriptions.delete(conversationId);
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action: "unsubscribe", conversation_id: conversationId }));
    }
  }

  disconnect() {
    this.closedByUser = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
  }

  private sendSubscribe(conversationId: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action: "subscribe", conversation_id: conversationId }));
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || !this.handlers || this.closedByUser) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.socket) {
        this.socket.onclose = null;
        this.socket.close();
        this.socket = null;
      }
      void this.connect(this.handlers!);
    }, 3000);
  }
}
