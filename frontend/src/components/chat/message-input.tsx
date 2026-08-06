"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MessageInput({
  disabled,
  onSend,
}: {
  disabled?: boolean;
  onSend: (query: string) => void;
}) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <div className="flex items-end gap-2 rounded-xl border border-border bg-surface-secondary p-2">
      <textarea
        rows={1}
        value={value}
        disabled={disabled}
        placeholder="Ask StudyBuddy anything..."
        className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <Button
        type="button"
        size="sm"
        disabled={disabled || !value.trim()}
        onClick={submit}
        aria-label="Send"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
