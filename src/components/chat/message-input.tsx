"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function MessageInput({
  disabled,
  onSend,
  prefill,
  prefillKey,
  sendBlockedReason,
}: {
  disabled?: boolean;
  onSend: (query: string) => void;
  prefill?: string | null;
  /** Changes when the same prefill text should be re-applied. */
  prefillKey?: number;
  /** Shown when the user has typed but cannot send yet. */
  sendBlockedReason?: string | null;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!prefill) return;
    setValue(prefill);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }, [prefill, prefillKey]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  const blocked = Boolean(sendBlockedReason);
  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    if (!blocked) setValue("");
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="space-y-2">
      {blocked && value.trim().length > 0 && (
        <p className="px-1 text-xs text-[var(--text-secondary)]" role="status">
          {sendBlockedReason}
        </p>
      )}
      <div
        className={cn(
          "chat-soft-card flex items-end gap-3 px-4 py-3 sm:px-5 sm:py-3.5",
          disabled && "opacity-60",
        )}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={disabled}
          placeholder="Ask anything about your materials…"
          className="max-h-[140px] min-h-[44px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-relaxed outline-none placeholder:text-muted focus-visible:ring-0 focus-visible:ring-offset-0"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button
          type="button"
          disabled={!canSend}
          onClick={submit}
          aria-label="Send"
          title={blocked ? sendBlockedReason ?? undefined : undefined}
          className={cn(
            "mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
            canSend
              ? blocked
                ? "border border-primary-700/30 bg-primary-700/10 text-primary-800"
                : "bg-primary-700 text-white hover:bg-primary-800"
              : "border border-border bg-white text-muted",
            "disabled:pointer-events-none",
          )}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
