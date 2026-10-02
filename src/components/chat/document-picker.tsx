"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, FileText, Search, Upload } from "lucide-react";
import { listDocuments } from "@/lib/api/documents";
import type { Document } from "@/types";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/config/routes";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { formatRelative } from "@/lib/utils/format";

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
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [internalOpen, setInternalOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
    if (!next) setQuery("");
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listDocuments({ status: "completed", limit: 50 })
      .then((data) => {
        if (!cancelled) setDocs(data.items);
      })
      .catch(() => {
        if (!cancelled) setDocs([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const id = window.setTimeout(() => searchRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  const selected = docs.find((d) => d.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((d) => d.name.toLowerCase().includes(q));
  }, [docs, query]);

  const selectDoc = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  if (!loading && docs.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border border-dashed border-black/[0.12] bg-surface-tertiary/60 px-3.5 py-3 dark:border-white/15 dark:bg-white/[0.03]",
          promptSelect && "border-primary-500/40 bg-primary-500/5 ring-2 ring-primary-500/20",
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/[0.04] dark:bg-white/10">
          <Upload className="h-4 w-4 text-[var(--text-secondary)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            No ready documents
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            Upload a study file, wait for processing, then chat with it.{" "}
            <Link
              href={routes.libraryUpload}
              className="font-medium text-brand underline-offset-2 hover:underline"
            >
              Go to library
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition",
          selected
            ? "border-black/[0.08] bg-panel hover:bg-black/[0.02] dark:border-white/10 dark:bg-surface-elevated dark:hover:bg-white/[0.04]"
            : "border-dashed border-black/[0.12] bg-surface-tertiary/50 hover:border-black/[0.18] hover:bg-surface-tertiary dark:border-white/15 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]",
          promptSelect &&
            !selected &&
            "border-primary-500/50 bg-primary-500/5 ring-2 ring-primary-500/25",
        )}
      >
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            selected
              ? "bg-primary-500/15 text-primary-700 dark:text-primary-300"
              : "bg-black/[0.05] text-[var(--text-secondary)] dark:bg-white/10",
          )}
        >
          <FileText className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          {selected ? (
            <>
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                {selected.name}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Grounding chat in this document · Tap to change
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {promptSelect
                  ? "Select a document to continue"
                  : "Choose a study document"}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Answers stay grounded in the file you pick
              </p>
            </>
          )}
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
            selected
              ? "bg-black/[0.05] text-[var(--text-secondary)] group-hover:bg-black/[0.08] dark:bg-white/10"
              : "bg-[var(--text-primary)] text-[var(--text-inverse)]",
          )}
        >
          {selected ? "Change" : "Browse"}
        </span>
      </button>

      <Modal
        open={isOpen}
        onOpenChange={setOpen}
        title="Select a document"
        description="Chat answers will be grounded in the document you choose."
        className="sm:w-[min(100%-2rem,28rem)]"
      >
        <div className="space-y-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your library…"
              className="h-11 w-full rounded-xl border border-border bg-surface-tertiary pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-muted outline-none transition focus-visible:border-primary-500 focus-visible:ring-1 focus-visible:ring-primary-500"
            />
          </label>

          <div className="max-h-[min(50dvh,22rem)] overflow-y-auto overscroll-contain rounded-xl border border-black/[0.06] dark:border-white/10">
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-[var(--text-secondary)]">
                <Spinner className="h-4 w-4" />
                Loading documents…
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-[var(--text-secondary)]">
                {query.trim()
                  ? `No documents match “${query.trim()}”.`
                  : "No completed documents yet."}
              </div>
            ) : (
              <ul className="divide-y divide-black/[0.05] dark:divide-white/10">
                {filtered.map((doc) => {
                  const isSelected = selectedId === doc.id;
                  return (
                    <li key={doc.id}>
                      <button
                        type="button"
                        onClick={() => selectDoc(doc.id)}
                        className={cn(
                          "flex w-full items-start gap-3 px-3.5 py-3 text-left transition",
                          isSelected
                            ? "bg-primary-500/10"
                            : "hover:bg-black/[0.03] dark:hover:bg-white/[0.05]",
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                            isSelected
                              ? "bg-primary-500/20 text-primary-700 dark:text-primary-300"
                              : "bg-black/[0.04] text-[var(--text-secondary)] dark:bg-white/10",
                          )}
                        >
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                            {doc.name}
                          </p>
                          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                            Updated {formatRelative(doc.updated_at)}
                          </p>
                        </div>
                        {isSelected && (
                          <Check
                            className="mt-1 h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400"
                            strokeWidth={2.5}
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-0.5">
            <Link
              href={routes.libraryUpload}
              className="text-xs font-medium text-brand underline-offset-2 hover:underline"
            >
              Upload new document
            </Link>
            {selectedId && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
