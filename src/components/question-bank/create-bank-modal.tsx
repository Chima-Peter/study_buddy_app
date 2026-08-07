"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { listDocuments } from "@/lib/api/documents";
import { generateQuestionBank } from "@/lib/api/question-bank";
import { ApiError } from "@/lib/api/client";
import { routes } from "@/config/routes";
import type { Document } from "@/types";
import { cn } from "@/lib/utils/cn";

export function CreateBankModal({
  open,
  onOpenChange,
  onQueued,
  existingDocumentIds = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQueued?: (document: Document) => void;
  /** Document ids that already have a ready or in-progress question bank */
  existingDocumentIds?: string[];
}) {
  const { toast } = useToast();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setSelectedId(null);
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
  }, [open]);

  const blocked = new Set(existingDocumentIds);

  const onGenerate = async () => {
    if (!selectedId) return;
    const doc = docs.find((d) => d.id === selectedId);
    if (!doc) return;

    setSubmitting(true);
    try {
      await generateQuestionBank(doc.id);
      toast({
        title: "Question bank queued",
        description: "You'll be notified when it's ready.",
        variant: "success",
      });
      onQueued?.(doc);
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Could not generate question bank",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="New question bank"
      description="Pick a completed document to generate a shuffled quiz."
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner className="h-7 w-7" />
        </div>
      ) : docs.length === 0 ? (
        <div className="space-y-4 rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            No completed documents yet. Upload and finish ingest first.
          </p>
          <Link href={routes.libraryUpload}>
            <Button variant="secondary" className="rounded-full">
              Go to library
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <ul className="max-h-64 space-y-1 overflow-y-auto overscroll-contain rounded-xl border border-border p-1.5">
            {docs.map((doc) => {
              const taken = blocked.has(doc.id);
              const selected = selectedId === doc.id;
              return (
                <li key={doc.id}>
                  <button
                    type="button"
                    disabled={taken || submitting}
                    onClick={() => setSelectedId(doc.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                      taken
                        ? "cursor-not-allowed opacity-45"
                        : "hover:bg-surface-tertiary",
                      selected && !taken && "bg-[#0f766e]/10 ring-1 ring-[#0f766e]/35",
                    )}
                  >
                    <FileText
                      className={cn(
                        "h-4 w-4 shrink-0",
                        selected ? "text-[#0f766e]" : "text-muted",
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate font-medium text-[var(--text-primary)]">
                      {doc.name}
                    </span>
                    {taken && (
                      <span className="shrink-0 text-[11px] text-muted">Has bank</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={onGenerate}
              disabled={!selectedId || submitting}
              className="rounded-full bg-[#0f766e] hover:bg-[#0d9488]"
            >
              {submitting ? "Queuing…" : "Generate"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
