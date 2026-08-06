"use client";

import { useEffect, useState } from "react";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import { listStudyCards } from "@/lib/api/study-cards";
import { useStudyStore } from "@/stores/study-store";
import { DeckCard } from "@/components/study/deck-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/spinner";
import { PageHeader } from "@/components/layout/page-header";
import type { StudyCardsStatus } from "@/types";
import { cn } from "@/lib/utils/cn";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-study-display",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-study-sans",
});

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
    <div
      className={cn(
        "relative space-y-6 font-[family-name:var(--font-study-sans)]",
        display.variable,
        sans.variable,
      )}
    >
      <div
        className="pointer-events-none absolute -inset-x-4 -top-6 h-64 rounded-[2rem] opacity-90 sm:-inset-x-6"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 15% 0%, rgba(45,212,191,0.2), transparent 55%), radial-gradient(ellipse 60% 50% at 90% 20%, rgba(240,196,25,0.12), transparent 50%)",
        }}
        aria-hidden
      />

      <div className="relative">
        <PageHeader
          title="Study Decks"
          description="Chapters, notes, and quizzes from your materials"
          actions={
            <select
              className="h-11 w-full rounded-full border border-[#0c2420]/12 bg-white/80 px-4 text-sm text-[#0c2420] shadow-sm backdrop-blur sm:w-auto"
              value={status}
              onChange={(e) => setStatus(e.target.value as "" | StudyCardsStatus)}
            >
              <option value="">All statuses</option>
              <option value="success">Ready</option>
              <option value="pending">Generating</option>
              <option value="failed">Failed</option>
            </select>
          }
        />
      </div>

      {loading && items.length === 0 ? (
        <div className="relative grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-[1.35rem]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="relative rounded-[1.35rem] border border-dashed border-[#0c2420]/15 bg-white/70 px-8 py-14 text-center backdrop-blur">
          <p className="font-[family-name:var(--font-study-display)] text-lg font-semibold text-[#0c2420]">
            No study decks yet
          </p>
          <p className="mt-2 text-sm text-[#5a7a73]">
            Generate cards from a completed document in your library
          </p>
        </div>
      ) : (
        <div className="relative grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((deck) => (
            <DeckCard key={deck.id || deck.document_id} deck={deck} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="relative flex justify-center">
          <Button
            variant="secondary"
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-full border-[#0f766e]/25 text-[#0f766e]"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
