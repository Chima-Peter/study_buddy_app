"use client";

import { useEffect, useState } from "react";
import { ChevronDown, FileText, X } from "lucide-react";
import { listDocuments } from "@/lib/api/documents";
import type { Document } from "@/types";
import { cn } from "@/lib/utils/cn";

export function DocumentPicker({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [open, setOpen] = useState(false);

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

  if (docs.length === 0) return null;

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
        onClick={() => setOpen((v) => !v)}
        className="chat-soft-card flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-left text-sm"
      >
        <FileText className="h-4 w-4 shrink-0 text-primary-700" />
        <span className="min-w-0 flex-1 text-[var(--text-secondary)]">
          {selected.length
            ? `${selected.length} document${selected.length > 1 ? "s" : ""} selected`
            : "Select documents to ground answers"}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
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
