"use client";

import { cn } from "@/lib/utils/cn";
import type { UiMessage } from "@/stores/chat-store";
import { Markdown } from "@/components/ui/markdown";
import { ThinkingIndicator } from "./thinking-indicator";

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

  const showThinking = message.streaming && !message.content;
  const showWriting = message.streaming && !!message.content;

  return (
    <div className="chat-soft-card space-y-2 px-4 py-4 sm:px-5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[var(--text-primary)]">
          Tutor
        </span>
        {showWriting && (
          <ThinkingIndicator label="Writing" compact className="gap-1.5" />
        )}
      </div>
      <div
        className={cn(
          "text-[15px] leading-relaxed text-[var(--text-primary)]",
          showThinking && "min-h-[1.25rem]",
        )}
      >
        {message.content ? (
          <Markdown className="chat-markdown">{message.content}</Markdown>
        ) : showThinking ? (
          <ThinkingIndicator label="Thinking" />
        ) : null}
      </div>
    </div>
  );
}
