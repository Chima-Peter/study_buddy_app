"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getStudyCards } from "@/lib/api/study-cards";
import { useStudyStore } from "@/stores/study-store";
import { ChapterNav } from "@/components/study/chapter-nav";
import { SectionContent } from "@/components/study/section-content";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";

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
        <h1 className="text-2xl font-semibold">Study deck unavailable</h1>
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={routes.study} className="text-sm text-primary-400 hover:underline">
          ← Back to Deck
        </Link>
        <Link href={routes.studyQuiz(params.documentId)}>
          <Button>Take Quiz</Button>
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-lg border border-border bg-surface-secondary p-3">
          <h2 className="mb-2 px-2 text-sm font-semibold">Chapters</h2>
          <ChapterNav
            chapters={chapters}
            activeKey={active.chapter_key}
            onSelect={setActiveKey}
          />
        </aside>
        <div className="space-y-6">
          <SectionContent chapter={active} />
          <div className="flex justify-between">
            <Button
              variant="ghost"
              disabled={activeIndex <= 0}
              onClick={() => setActiveKey(chapters[activeIndex - 1].chapter_key)}
            >
              ← Prev
            </Button>
            <Button
              variant="ghost"
              disabled={activeIndex >= chapters.length - 1}
              onClick={() => setActiveKey(chapters[activeIndex + 1].chapter_key)}
            >
              Next →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
