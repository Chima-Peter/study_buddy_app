"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function MessageInput({
  disabled,
  onSend,
}: {
  disabled?: boolean;
  onSend: (query: string) => void;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div
      className={cn(
        "chat-soft-card flex items-end gap-3 px-4 py-3 sm:px-5 sm:py-3.5",
        "focus-within:ring-2 focus-within:ring-primary-500/20",
        disabled && "opacity-60",
      )}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        disabled={disabled}
        placeholder="Ask anything about your materials…"
        className="max-h-[140px] min-h-[44px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-relaxed outline-none placeholder:text-muted"
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
        className={cn(
          "mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
          canSend
            ? "bg-primary-700 text-white hover:bg-primary-800"
            : "border border-border bg-white text-muted",
          "disabled:pointer-events-none",
        )}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </div>
  );
}
