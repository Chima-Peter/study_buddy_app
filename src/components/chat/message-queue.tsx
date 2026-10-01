"use client";

import { useState } from "react";
import { Check, ChevronDown, Circle, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { QueuedMessage } from "@/stores/chat-store";

export function MessageQueue({
  items,
  onEdit,
  onDelete,
}: {
  items: QueuedMessage[];
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  if (items.length === 0) return null;

  const startEdit = (item: QueuedMessage) => {
    setEditingId(item.id);
    setDraft(item.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft("");
  };

  const commitEdit = (id: string) => {
    const trimmed = draft.trim();
    if (!trimmed || !onEdit) {
      cancelEdit();
      return;
    }
    onEdit(id, trimmed);
    cancelEdit();
  };

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
              {editingId === item.id ? (
                <div className="min-w-0 flex-1 space-y-1.5">
                  <textarea
                    value={draft}
                    rows={2}
                    autoFocus
                    className="w-full resize-none rounded-lg border border-black/[0.08] bg-transparent px-2 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-black/20 dark:border-white/10"
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        commitEdit(item.id);
                      }
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => commitEdit(item.id)}
                      className="rounded-md p-1 text-[var(--text-primary)] hover:bg-black/[0.04] dark:hover:bg-white/5"
                      aria-label="Save"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-md p-1 text-[var(--text-secondary)] hover:bg-black/[0.04] dark:hover:bg-white/5"
                      aria-label="Cancel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="min-w-0 flex-1 truncate pt-0.5 text-sm text-[var(--text-primary)]">
                    {item.content}
                  </p>
                  <div className="flex shrink-0 gap-0.5">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="rounded-md p-1 text-[var(--text-secondary)] hover:bg-black/[0.04] hover:text-[var(--text-primary)] dark:hover:bg-white/5"
                        aria-label="Edit queued message"
                      >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="rounded-md p-1 text-[var(--text-secondary)] hover:bg-black/[0.04] hover:text-error dark:hover:bg-white/5"
                        aria-label="Remove queued message"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
