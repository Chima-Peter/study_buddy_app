"use client";

import { cn } from "@/lib/utils/cn";
import type { UiMessage } from "@/stores/chat-store";
import { Markdown } from "@/components/ui/markdown";

export function MessageBubble({ message }: { message: UiMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[min(100%,28rem)] rounded-[1.25rem] bg-primary-700 px-4 py-3 text-[15px] leading-relaxed text-white shadow-md">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-soft-card space-y-2 px-4 py-4 sm:px-5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[var(--text-primary)]">
          Tutor
        </span>
        {message.streaming && (
          <span className="text-xs text-muted">Writing…</span>
        )}
      </div>
      <div
        className={cn(
          "text-[15px] leading-relaxed text-[var(--text-primary)]",
          !message.content && message.streaming && "min-h-[1.25rem]",
        )}
      >
        {message.content ? (
          <Markdown className="chat-markdown">{message.content}</Markdown>
        ) : message.streaming ? (
          <span className="inline-flex gap-1" aria-label="Typing">
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary-600" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary-600" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary-600" />
          </span>
        ) : null}
      </div>
    </div>
  );
}
