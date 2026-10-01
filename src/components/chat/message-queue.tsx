"use client";

import { useState } from "react";
import { ChevronDown, Circle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { QueuedMessage } from "@/stores/chat-store";

export function MessageQueue({ items }: { items: QueuedMessage[] }) {
  const [expanded, setExpanded] = useState(true);

  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-panel shadow-sm dark:border-white/10 dark:bg-surface-elevated">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-1.5 px-3.5 py-2.5 text-left text-sm font-medium text-[var(--text-primary)]"
        aria-expanded={expanded}
      >
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[var(--text-secondary)] transition-transform",
            !expanded && "-rotate-90",
          )}
        />
        {items.length} Queued
      </button>

      {expanded && (
        <ul className="space-y-1 border-t border-black/[0.06] px-2 py-2 dark:border-white/10">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-2 rounded-xl px-2 py-1.5"
            >
              <Circle className="mt-1.5 h-3 w-3 shrink-0 text-[var(--text-secondary)]" />
              <p className="min-w-0 flex-1 truncate pt-0.5 text-sm text-[var(--text-primary)]">
                {item.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
