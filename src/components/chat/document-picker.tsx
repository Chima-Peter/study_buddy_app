"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, FileText, X } from "lucide-react";
import { listDocuments } from "@/lib/api/documents";
import type { Document } from "@/types";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/config/routes";

export function DocumentPicker({
  selectedIds,
  onChange,
  open,
  onOpenChange,
  promptSelect,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
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

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) onChange(selectedIds.filter((x) => x !== id));
    else onChange([...selectedIds, id]);
  };

  const selected = docs.filter((d) => selectedIds.includes(d.id));

  if (docs.length === 0) {
    return (
      <div
        className={cn(
          "chat-soft-card flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-sm",
          promptSelect && "ring-2 ring-primary-500/35",
        )}
      >
        <FileText className="h-4 w-4 shrink-0 text-primary-700" />
        <span className="min-w-0 flex-1 text-[var(--text-secondary)]">
          Upload a document to start chatting.{" "}
          <Link
            href={routes.libraryUpload}
            className="font-medium text-primary-800 underline-offset-2 hover:underline"
          >
            Go to library
          </Link>
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((d) => (
            <span
              key={d.id}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] shadow-sm"
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-primary-700" />
              <span className="truncate">{d.name}</span>
              <button
                type="button"
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full hover:bg-surface-tertiary hover:text-[var(--text-primary)]"
                onClick={() => toggle(d.id)}
                aria-label={`Remove ${d.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!isOpen)}
        className={cn(
          "chat-soft-card flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-left text-sm",
          promptSelect &&
            selected.length === 0 &&
            "ring-2 ring-primary-500/35",
        )}
      >
        <FileText className="h-4 w-4 shrink-0 text-primary-700" />
        <span className="min-w-0 flex-1 text-[var(--text-secondary)]">
          {selected.length
            ? `${selected.length} document${selected.length > 1 ? "s" : ""} selected`
            : promptSelect
              ? "Select at least one document to continue"
              : "Select documents to ground answers"}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="chat-soft-card max-h-44 space-y-0.5 overflow-y-auto overscroll-contain p-2 sm:max-h-52">
          {docs.map((d) => {
            const isSelected = selectedIds.includes(d.id);
            return (
              <label
                key={d.id}
                className={cn(
                  "flex min-touch cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
                  isSelected
                    ? "bg-primary-500/10 text-primary-800"
                    : "hover:bg-white/70",
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(d.id)}
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
