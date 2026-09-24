"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { StudyCards } from "@/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import { deleteStudyCards, retryStudyCards } from "@/lib/api/study-cards";
import { useStudyStore } from "@/stores/study-store";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

function statusLabel(status: StudyCards["status"]) {
  if (status === "success") return "Ready";
  if (status === "failed") return "Failed";
  return "Generating";
}

export function DeckCard({ deck }: { deck: StudyCards }) {
  const { toast } = useToast();
  const remove = useStudyStore((s) => s.remove);
  const [retrying, setRetrying] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const title =
    deck.document_name?.trim() || `Document ${deck.document_id.slice(0, 8)}…`;
  const canDelete = deck.status === "success" || deck.status === "failed";

  const retry = async () => {
    setRetrying(true);
    try {
      await retryStudyCards(deck.document_id);
      toast({ title: "Regeneration queued", variant: "success" });
    } catch (err) {
      toast({
        title: "Could not regenerate",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setRetrying(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await deleteStudyCards(deck.document_id);
      remove(deck.document_id);
      toast({ title: "Study deck deleted", variant: "success" });
      setConfirmDelete(false);
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <article className="study-flashcard relative overflow-hidden">
        <div
          className="pointer-events-none absolute right-0 top-0 h-14 w-14"
          style={{
            background:
              "linear-gradient(225deg, rgba(240,196,25,0.55) 0%, rgba(240,196,25,0.08) 45%, transparent 55%)",
          }}
          aria-hidden
        />

        <div className="flex items-center justify-between gap-3 border-b border-[#0c2420]/08 px-5 pb-3 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0f766e]">
            Study deck
          </p>
          <span
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.12em]",
              deck.status === "success" && "text-[#0f766e]",
              deck.status === "failed" && "text-[#b91c1c]",
              deck.status === "pending" && "text-[#b45309]",
            )}
          >
            {statusLabel(deck.status)}
          </span>
        </div>

        <div className="relative px-5 pb-2 pt-5">
          <div
            className="absolute left-0 top-5 bottom-2 w-1 rounded-r-full bg-[#14b8a6]"
            aria-hidden
          />
          <h3 className="line-clamp-2 pl-3 font-[family-name:var(--font-study-display)] text-xl font-semibold leading-tight tracking-tight text-[#0c2420]">
            {title}
          </h3>

          {deck.status === "success" && (
            <p className="mt-2 pl-3 font-[family-name:var(--font-study-sans)] text-sm text-[#5a7a73]">
              {deck.chapter_count ?? 0} chapters · {deck.question_count ?? 0}{" "}
              questions
            </p>
          )}
          {deck.status === "pending" && (
            <p className="mt-2 pl-3 font-[family-name:var(--font-study-sans)] text-sm text-[#5a7a73]">
              Generating study cards…
            </p>
          )}
          {deck.status === "failed" && (
            <p className="mt-2 pl-3 font-[family-name:var(--font-study-sans)] text-sm text-[#5a7a73]">
              Generation failed — you can retry
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 px-5 pb-5 pt-4">
          {deck.status === "success" && (
            <Link
              href={routes.studyDeck(deck.document_id)}
              className="min-w-0 flex-1"
            >
              <Button
                size="sm"
                className="w-full rounded-full bg-[#0f766e] hover:bg-[#0d9488]"
              >
                Read
              </Button>
            </Link>
          )}
          {deck.status === "failed" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={retry}
              disabled={retrying}
              className="min-w-0 flex-1 rounded-full border-[#0f766e]/30 text-[#0f766e]"
            >
              {retrying && (
                <Spinner className="h-3.5 w-3.5 border-[#0f766e]/40 border-t-[#0f766e]" />
              )}
              {retrying ? "Queuing…" : "Retry"}
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 rounded-full text-error hover:bg-error/10 hover:text-error"
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete study deck"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </article>

      <Modal
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete study deck?"
        description="This permanently removes the study cards for this document. You can generate them again later."
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" disabled={deleting} onClick={onDelete}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
