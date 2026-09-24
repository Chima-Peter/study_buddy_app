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
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
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
          "flex items-end gap-2 rounded-[1.75rem] border border-black/[0.08] bg-white px-3 py-2 shadow-[0_0_0_1px_rgba(0,0,0,0.02),0_8px_24px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-surface-elevated",
          disabled && "opacity-60",
        )}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={disabled}
          placeholder="Ask anything…"
          className="max-h-[200px] min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] leading-relaxed outline-none placeholder:text-muted focus-visible:ring-0 focus-visible:ring-offset-0"
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
            "mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
            canSend
              ? blocked
                ? "bg-black/[0.08] text-[var(--text-secondary)]"
                : "bg-[var(--text-primary)] text-white hover:opacity-90"
              : "bg-black/[0.06] text-muted dark:bg-white/10",
            "disabled:pointer-events-none",
          )}
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
