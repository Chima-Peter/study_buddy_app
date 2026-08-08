"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getStudyCards, retryStudyCards } from "@/lib/api/study-cards";
import { useStudyStore } from "@/stores/study-store";
import { ChapterNav } from "@/components/study/chapter-nav";
import { MiniStudyCards } from "@/components/study/mini-study-cards";
import { Button } from "@/components/ui/button";
import { PageLoader, Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/layout/page-header";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { routes } from "@/config/routes";
import { formatChapterTitle } from "@/lib/utils/format";

function deckFromStore(documentId: string) {
  const { current, items } = useStudyStore.getState();
  if (current?.document_id === documentId && current.result) return current;
  return items.find((d) => d.document_id === documentId && d.result) ?? null;
}

export default function StudyDeckPage() {
  const params = useParams<{ documentId: string }>();
  const { toast } = useToast();
  const setCurrent = useStudyStore((s) => s.setCurrent);
  const upsert = useStudyStore((s) => s.upsert);
  const current = useStudyStore((s) => s.current);
  const [loading, setLoading] = useState(() => !deckFromStore(params.documentId));
  const [activeKey, setActiveKey] = useState<string>("");
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const apply = (deck: NonNullable<ReturnType<typeof deckFromStore>>) => {
      setCurrent(deck);
      upsert(deck);
      const first = deck.result?.chapters?.[0]?.chapter_key;
      if (first) setActiveKey((prev) => prev || first);
    };

    (async () => {
      const cached = deckFromStore(params.documentId);
      if (cached) {
        apply(cached);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const deck = await getStudyCards(params.documentId);
        if (cancelled) return;
        apply(deck);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.documentId, setCurrent, upsert]);

  const chapters = useMemo(
    () => current?.result?.chapters ?? [],
    [current?.result?.chapters],
  );
  const active = useMemo(
    () => chapters.find((c) => c.chapter_key === activeKey) ?? chapters[0],
    [chapters, activeKey],
  );
  const activeIndex = chapters.findIndex((c) => c.chapter_key === active?.chapter_key);

  const onRetry = async () => {
    setRetrying(true);
    try {
      await retryStudyCards(params.documentId);
      const pending = {
        id: params.documentId,
        document_id: params.documentId,
        document_name: current?.document_name ?? "",
        status: "pending" as const,
        result: null,
        created_at: current?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      upsert(pending);
      setCurrent(pending);
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <PageLoader label="Loading study deck" />
      </div>
    );
  }

  if (!current || current.status !== "success" || !active) {
    const failed = current?.status === "failed";
    return (
      <div className="space-y-4">
        <PageHeader title="Study deck unavailable" showBack backHref={routes.study} />
        <p className="text-[var(--text-secondary)]">
          {failed
            ? "Generation failed. You can retry, or return to the Study index."
            : "Cards may still be generating, or generation failed. Check the Study index."}
        </p>
        <div className="flex flex-wrap gap-2">
          {failed && (
            <Button onClick={onRetry} disabled={retrying}>
              {retrying && (
                <Spinner className="h-3.5 w-3.5 border-white/40 border-t-white" />
              )}
              {retrying ? "Queuing…" : "Retry"}
            </Button>
          )}
          <Link href={routes.study}>
            <Button variant="secondary">Back to decks</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Study Deck"
        showBack
        backHref={routes.study}
        actions={
          (active.quiz?.length ?? 0) > 0 ? (
            <Link
              href={routes.studyQuiz(params.documentId, active.chapter_key)}
              className="w-full sm:w-auto"
            >
              <Button className="w-full sm:w-auto">Take chapter quiz</Button>
            </Link>
          ) : undefined
        }
      />

      <label className="block space-y-1.5 lg:hidden">
        <span className="text-sm font-medium text-[var(--text-secondary)]">Chapter</span>
        <select
          className="h-11 w-full rounded-md border border-border bg-surface-secondary px-3 text-sm"
          value={active.chapter_key}
          onChange={(e) => setActiveKey(e.target.value)}
        >
          {chapters.map((ch) => (
            <option key={ch.chapter_key} value={ch.chapter_key}>
              {formatChapterTitle(ch.chapter_key)}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
        <aside className="hidden rounded-2xl border border-border bg-surface-secondary p-3 lg:sticky lg:top-4 lg:block">
          <h2 className="mb-2 px-2 text-sm font-semibold">Chapters</h2>
          <ChapterNav
            chapters={chapters}
            activeKey={active.chapter_key}
            onSelect={setActiveKey}
          />
        </aside>

        <div className="min-w-0 space-y-6">
          <MiniStudyCards chapter={active} />

          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <Button
              variant="ghost"
              disabled={activeIndex <= 0}
              onClick={() => setActiveKey(chapters[activeIndex - 1].chapter_key)}
            >
              ← Prev chapter
            </Button>
            <Button
              variant="ghost"
              disabled={activeIndex >= chapters.length - 1}
              onClick={() => setActiveKey(chapters[activeIndex + 1].chapter_key)}
            >
              Next chapter →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
