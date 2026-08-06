"use client";

import { cn } from "@/lib/utils/cn";
import type { UiMessage } from "@/stores/chat-store";

export function MessageBubble({ message }: { message: UiMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-primary-700 text-white"
            : "bg-surface-tertiary text-[var(--text-primary)]",
        )}
      >
        {message.content || (message.streaming ? "…" : "")}
        {message.streaming && (
          <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-primary-600 align-middle" />
        )}
      </div>
    </div>
  );
}
