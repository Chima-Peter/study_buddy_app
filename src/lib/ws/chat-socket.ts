import { env } from "@/config/env";
import type { WsFrame } from "@/types";

type FrameHandler = (frame: WsFrame) => void;

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
    this.ws?.close();
    this.ws = null;
    this.onStatus?.(false);
  }

  reconnectWithNewToken() {
    this.ws?.close();
    this.open();
  }

  send(payload: {
    query: string;
    conversation_id?: string;
    document_ids?: string[];
  }) {
    const message = JSON.stringify(payload);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      this.queue.push(message);
    }
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
        // ignore
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
