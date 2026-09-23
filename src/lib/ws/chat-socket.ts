import { env } from "@/config/env";
import type { WsFrame } from "@/types";
import { useSessionStore } from "@/stores/session-store";

type FrameHandler = (frame: WsFrame) => void;

export type ChatSendPayload = {
  type: "chat" | "edit" | "retry";
  query: string;
  conversation_id?: string;
  document_ids?: string[];
  continuation_key?: string;
};

function isAuthClose(code: number, reason: string) {
  if (code === 1008) return true;
  const lower = reason.toLowerCase();
  return lower.includes("not authenticated") || lower.includes("unauthorized");
}

export class ChatSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private readyTimer: ReturnType<typeof setTimeout> | null = null;
  private backoffMs = 1000;
  private shouldReconnect = true;
  private sessionReady = false;
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
    if (this.readyTimer) clearTimeout(this.readyTimer);
    this.readyTimer = null;
    this.sessionReady = false;
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
    if (this.ws?.readyState === WebSocket.OPEN && this.sessionReady) {
      this.ws.send(message);
    } else {
      this.queue.push(message);
    }
  }

  get connected() {
    return this.ws?.readyState === WebSocket.OPEN && this.sessionReady;
  }

  private markSessionReady() {
    if (this.sessionReady) return;
    this.sessionReady = true;
    if (this.readyTimer) {
      clearTimeout(this.readyTimer);
      this.readyTimer = null;
    }
    this.onStatus?.(true);
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    while (this.queue.length > 0) {
      const msg = this.queue.shift();
      if (msg) ws.send(msg);
    }
  }

  private open() {
    const token = this.getToken();
    if (!token) {
      this.shouldReconnect = false;
      return;
    }

    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
    }

    if (this.readyTimer) clearTimeout(this.readyTimer);
    this.sessionReady = false;

    const ws = new WebSocket(`${env.wsUrl}/chat?token=${encodeURIComponent(token)}`);
    this.ws = ws;

    ws.onopen = () => {
      this.backoffMs = 1000;
      // First frame may be token_refresh; fall back so idle sockets still become usable.
      this.readyTimer = setTimeout(() => this.markSessionReady(), 100);
    };

    ws.onmessage = (ev) => {
      try {
        const frame = JSON.parse(ev.data) as WsFrame;
        if (frame.type === "token_refresh") {
          if (typeof frame.token === "string" && frame.token) {
            syncSharedChatSocketToken(frame.token);
            useSessionStore.getState().setToken(frame.token);
          }
          this.markSessionReady();
          return;
        }
        this.markSessionReady();
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

    ws.onclose = (ev) => {
      this.sessionReady = false;
      if (this.readyTimer) {
        clearTimeout(this.readyTimer);
        this.readyTimer = null;
      }
      this.onStatus?.(false);
      if (isAuthClose(ev.code, ev.reason)) {
        this.shouldReconnect = false;
        return;
      }
      if (this.shouldReconnect) this.scheduleReconnect();
    };

    ws.onerror = () => {
      ws.close();
    };
  }

  private scheduleReconnect() {
    if (!this.shouldReconnect) return;
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

/** Keep shared socket in sync when WS itself refreshed the token (avoid reconnect). */
export function syncSharedChatSocketToken(token: string) {
  lastToken = token;
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
