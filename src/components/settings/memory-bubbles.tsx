"use client";

import { Brain } from "lucide-react";
import type { Memory } from "@/types";
import { formatRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function MemoryBubbles({
  items,
  emptyMessage = "No memories yet",
}: {
  items: Memory[];
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-tertiary text-muted">
          <Brain className="h-4 w-4" />
        </span>
        <p className="max-w-sm text-sm text-[var(--text-secondary)]">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-panel">
      {items.map((memory) => (
        <li
          key={memory.id}
          className={cn(
            "group flex items-start gap-3 px-4 py-3.5 transition-colors",
            "hover:bg-surface-tertiary/60",
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="text-[15px] leading-relaxed text-[var(--text-primary)]">
              {memory.content}
            </p>
            <p className="mt-1 text-xs text-muted">
              {formatRelative(memory.created_at)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
