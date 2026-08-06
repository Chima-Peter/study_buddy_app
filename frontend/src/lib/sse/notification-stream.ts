import { env } from "@/config/env";
import type { SseEvent } from "@/types";

export type SseHandler = (event: SseEvent, eventId?: string) => void;

export class NotificationStream {
  private abortController: AbortController | null = null;
  private lastEventId: string | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private backoffMs = 1000;

  constructor(
    private getToken: () => string | null,
    private onEvent: SseHandler,
    private onStatus?: (connected: boolean) => void,
  ) {}

  start() {
    void this.connect();
  }

  stop() {
    this.abortController?.abort();
    this.abortController = null;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.onStatus?.(false);
  }

  private async connect() {
    const token = this.getToken();
    if (!token) return;

    this.abortController?.abort();
    this.abortController = new AbortController();

    try {
      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
      };
      if (this.lastEventId) {
        headers["Last-Event-ID"] = this.lastEventId;
      }

      const res = await fetch(`${env.apiUrl}/notifications/stream`, {
        headers,
        signal: this.abortController.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`SSE failed: ${res.status}`);
      }

      this.onStatus?.(true);
      this.backoffMs = 1000;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          this.parseEvent(part);
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      this.onStatus?.(false);
      this.scheduleReconnect();
    }
  }

  private parseEvent(raw: string) {
    const lines = raw.split("\n");
    let id: string | undefined;
    let eventType = "message";
    let data = "";

    for (const line of lines) {
      if (line.startsWith("id:")) id = line.slice(3).trim();
      else if (line.startsWith("event:")) eventType = line.slice(6).trim();
      else if (line.startsWith("data:")) data += line.slice(5).trim();
    }

    if (eventType === "ping") return;
    if (!data) return;

    if (id) this.lastEventId = id;

    try {
      const parsed = JSON.parse(data) as SseEvent;
      this.onEvent(parsed, id);
    } catch {
      // ignore malformed payloads
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.backoffMs = Math.min(this.backoffMs * 2, 30000);
      void this.connect();
    }, this.backoffMs);
  }
}
