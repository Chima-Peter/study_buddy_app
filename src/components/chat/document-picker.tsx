"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, FileText, X } from "lucide-react";
import { listDocuments } from "@/lib/api/documents";
import type { Document } from "@/types";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/config/routes";

export function DocumentPicker({
  selectedId,
  onChange,
  open,
  onOpenChange,
  promptSelect,
}: {
  selectedId: string | null;
  onChange: (id: string | null) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  promptSelect?: boolean;
}) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    listDocuments({ status: "completed", limit: 50 })
      .then((data) => setDocs(data.items))
      .catch(() => setDocs([]));
  }, []);

  const selected = docs.find((d) => d.id === selectedId) ?? null;

  if (docs.length === 0) {
    return (
      <div
        className={cn(
          "flex min-h-10 w-full items-center gap-2.5 rounded-2xl border border-black/[0.06] bg-surface-tertiary px-3.5 py-2 text-sm dark:border-white/10 dark:bg-white/5",
          promptSelect && "ring-2 ring-primary-500/30",
        )}
      >
        <FileText className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
        <span className="min-w-0 flex-1 text-[var(--text-secondary)]">
          Upload a document to start chatting.{" "}
          <Link
            href={routes.libraryUpload}
            className="font-medium text-brand underline-offset-2 hover:underline"
          >
            Go to library
          </Link>
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {selected && (
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-black/[0.06] bg-surface-tertiary px-2.5 py-1 text-xs text-[var(--text-secondary)] dark:border-white/10 dark:bg-white/5">
            <FileText className="h-3 w-3 shrink-0 opacity-70" />
            <span className="truncate">{selected.name}</span>
            <button
              type="button"
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full hover:bg-black/[0.06] hover:text-[var(--text-primary)] dark:hover:bg-white/10"
              onClick={() => onChange(null)}
              aria-label={`Remove ${selected.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!isOpen)}
        className={cn(
          "flex min-h-10 w-full items-center gap-2.5 rounded-2xl border border-black/[0.06] bg-surface-tertiary px-3.5 py-2 text-left text-sm transition hover:bg-surface-tertiary dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/[0.08]",
          promptSelect && !selected && "ring-2 ring-primary-500/30",
        )}
      >
        <FileText className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
        <span className="min-w-0 flex-1 text-[var(--text-secondary)]">
          {selected
            ? selected.name
            : promptSelect
              ? "Select a document to continue"
              : "Select a document"}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="max-h-44 space-y-0.5 overflow-y-auto overscroll-contain rounded-2xl border border-black/[0.06] bg-panel p-1.5 shadow-sm dark:border-white/10 dark:bg-surface-elevated sm:max-h-52">
          {docs.map((d) => {
            const isSelected = selectedId === d.id;
            return (
              <label
                key={d.id}
                className={cn(
                  "flex min-touch cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm",
                  isSelected
                    ? "bg-black/[0.04] text-[var(--text-primary)] dark:bg-white/10"
                    : "hover:bg-black/[0.03] dark:hover:bg-white/[0.06]",
                )}
              >
                <input
                  type="radio"
                  name="chat-document"
                  checked={isSelected}
                  onChange={() => {
                    onChange(d.id);
                    setOpen(false);
                  }}
                  className="accent-primary-700"
                />
                <span className="truncate">{d.name}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
