import { env } from "@/config/env";
import type { WsFrame } from "@/types";

type FrameHandler = (frame: WsFrame) => void;

export type ChatSendPayload = {
  query: string;
  conversation_id?: string;
  document_ids?: string[];
};

export class ChatSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private backoffMs = 1000;
  private shouldReconnect = true;
  private queue: string[] = [];

  constructor(
    private getToken: () => string | null,
    private onFrame: FrameHandler,
    private onStatus?: (connected: boolean) => void,
  ) {}

  connect() {
    this.shouldReconnect = true;
    this.open();
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.queue = [];
    this.onStatus?.(false);
  }

  reconnectWithNewToken() {
    this.shouldReconnect = true;
    this.open();
  }

  send(payload: ChatSendPayload) {
    const message = JSON.stringify(payload);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      this.queue.push(message);
    }
  }

  get connected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private open() {
    const token = this.getToken();
    if (!token) return;

    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
    }

    const ws = new WebSocket(`${env.wsUrl}/chat?token=${encodeURIComponent(token)}`);
    this.ws = ws;

    ws.onopen = () => {
      this.backoffMs = 1000;
      this.onStatus?.(true);
      while (this.queue.length > 0) {
        const msg = this.queue.shift();
        if (msg) ws.send(msg);
      }
    };

    ws.onmessage = (ev) => {
      try {
        const frame = JSON.parse(ev.data) as WsFrame;
        if (frame.type === "heartbeat") {
          if (typeof frame.response === "string" && frame.response.toLowerCase() === "ping") {
            ws.send(JSON.stringify({ query: "ping" }));
          }
          return;
        }
        this.onFrame(frame);
      } catch {
        // ignore malformed frames
      }
    };

    ws.onclose = () => {
      this.onStatus?.(false);
      if (this.shouldReconnect) this.scheduleReconnect();
    };

    ws.onerror = () => {
      ws.close();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.backoffMs = Math.min(this.backoffMs * 2, 30000);
      this.open();
    }, this.backoffMs);
  }
}

/** Single shared socket for all conversations (scoped via conversation_id). */
let sharedSocket: ChatSocket | null = null;
let frameHandler: FrameHandler = () => {};
let lastToken: string | null = null;

export function setChatFrameHandler(handler: FrameHandler) {
  frameHandler = handler;
}

export function ensureSharedChatSocket(getToken: () => string | null): ChatSocket | null {
  const token = getToken();
  if (!token) {
    disconnectSharedChatSocket();
    return null;
  }

  if (!sharedSocket) {
    sharedSocket = new ChatSocket(getToken, (frame) => frameHandler(frame));
    sharedSocket.connect();
    lastToken = token;
    return sharedSocket;
  }

  if (lastToken !== token) {
    lastToken = token;
    sharedSocket.reconnectWithNewToken();
  }

  return sharedSocket;
}

export function disconnectSharedChatSocket() {
  sharedSocket?.disconnect();
  sharedSocket = null;
  lastToken = null;
}

export function getSharedChatSocket() {
  return sharedSocket;
}
