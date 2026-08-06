"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getStudyCards } from "@/lib/api/study-cards";
import { useStudyStore } from "@/stores/study-store";
import { ChapterNav } from "@/components/study/chapter-nav";
import { MiniStudyCards } from "@/components/study/mini-study-cards";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { formatChapterTitle } from "@/lib/utils/format";

export default function StudyDeckPage() {
  const params = useParams<{ documentId: string }>();
  const setCurrent = useStudyStore((s) => s.setCurrent);
  const upsert = useStudyStore((s) => s.upsert);
  const current = useStudyStore((s) => s.current);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const deck = await getStudyCards(params.documentId);
        if (cancelled) return;
        setCurrent(deck);
        upsert(deck);
        const first = deck.result?.chapters?.[0]?.chapter_key;
        if (first) setActiveKey(first);
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!current || current.status !== "success" || !active) {
    return (
      <div className="space-y-4">
        <PageHeader title="Study deck unavailable" showBack backHref={routes.study} />
        <p className="text-[var(--text-secondary)]">
          Cards may still be generating, or generation failed. Check the Study index.
        </p>
        <Link href={routes.study}>
          <Button variant="secondary">Back to decks</Button>
        </Link>
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
