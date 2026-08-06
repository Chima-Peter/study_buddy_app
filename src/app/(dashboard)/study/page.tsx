"use client";

import { useEffect, useState } from "react";
import { listStudyCards } from "@/lib/api/study-cards";
import { useStudyStore } from "@/stores/study-store";
import { DeckCard } from "@/components/study/deck-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/spinner";
import { PageHeader } from "@/components/layout/page-header";
import type { StudyCardsStatus } from "@/types";

export default function StudyPage() {
  const { items, hasMore, nextCursor, setPage } = useStudyStore();
  const [status, setStatus] = useState<"" | StudyCardsStatus>("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await listStudyCards({
          status: status || undefined,
        });
        if (!cancelled) setPage(data.items, data.next_cursor, data.has_more);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, setPage]);

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const data = await listStudyCards({
        cursor: nextCursor,
        status: status || undefined,
      });
      setPage(data.items, data.next_cursor, data.has_more, true);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Decks"
        description="Chapters, notes, and quizzes from your materials"
        actions={
          <select
            className="h-11 w-full rounded-md border border-border bg-surface-tertiary px-3 text-sm sm:w-auto"
            value={status}
            onChange={(e) => setStatus(e.target.value as "" | StudyCardsStatus)}
          >
            <option value="">All statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        }
      />

      {loading && items.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="font-medium">No study decks yet</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Generate cards from a completed document in your library
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((deck) => (
            <DeckCard key={deck.id || deck.document_id} deck={deck} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
