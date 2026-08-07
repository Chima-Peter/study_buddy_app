"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getStudyCards } from "@/lib/api/study-cards";
import { useStudyStore } from "@/stores/study-store";
import type { QuizQuestion, StudyCards } from "@/types";
import { QuizPlayer } from "@/components/study/quiz-player";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { formatChapterTitle } from "@/lib/utils/format";
import { routes } from "@/config/routes";

function deckFromStore(documentId: string): StudyCards | null {
  const { current, items } = useStudyStore.getState();
  if (current?.document_id === documentId && current.result) return current;
  return items.find((d) => d.document_id === documentId && d.result) ?? null;
}

export default function ChapterQuizPage() {
  const params = useParams<{ documentId: string; chapterKey: string }>();
  const chapterKey = decodeURIComponent(params.chapterKey);
  const upsert = useStudyStore((s) => s.upsert);
  const setCurrent = useStudyStore((s) => s.setCurrent);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [found, setFound] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const applyDeck = (deck: StudyCards) => {
      const chapter = deck.result?.chapters.find((c) => c.chapter_key === chapterKey);
      if (!chapter) {
        setFound(false);
        setQuestions([]);
        return;
      }
      setFound(true);
      setQuestions(chapter.quiz ?? []);
    };

    (async () => {
      const cached = deckFromStore(params.documentId);
      if (cached) {
        applyDeck(cached);
        setLoading(false);
        return;
      }

      try {
        const deck = await getStudyCards(params.documentId);
        if (cancelled) return;
        upsert(deck);
        setCurrent(deck);
        applyDeck(deck);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params.documentId, chapterKey, upsert, setCurrent]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${formatChapterTitle(chapterKey)} Quiz`}
        showBack
        backHref={routes.studyDeck(params.documentId)}
      />
      {!found ? (
        <div className="space-y-3">
          <p className="text-[var(--text-secondary)]">Chapter not found in this deck.</p>
          <Link href={routes.studyDeck(params.documentId)}>
            <Button variant="secondary">Back</Button>
          </Link>
        </div>
      ) : questions.length === 0 ? (
        <div className="space-y-3">
          <p className="text-[var(--text-secondary)]">
            No quiz questions for this chapter yet.
          </p>
          <Link href={routes.studyDeck(params.documentId)}>
            <Button variant="secondary">Back</Button>
          </Link>
        </div>
      ) : (
        <QuizPlayer
          documentId={params.documentId}
          chapterKey={chapterKey}
          questions={questions}
        />
      )}
    </div>
  );
}
