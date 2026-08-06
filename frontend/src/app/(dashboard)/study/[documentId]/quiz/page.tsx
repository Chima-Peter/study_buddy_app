"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getStudyCards } from "@/lib/api/study-cards";
import type { QuizQuestion } from "@/types";
import { QuizPlayer } from "@/components/study/quiz-player";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export default function QuizPage() {
  const params = useParams<{ documentId: string }>();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const deck = await getStudyCards(params.documentId);
        if (cancelled) return;
        const all =
          deck.result?.chapters.flatMap((c) => c.quiz ?? []) ?? [];
        setQuestions(all);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.documentId]);

  const title = useMemo(() => "Chapter Quiz", []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={routes.studyDeck(params.documentId)}
          className="text-sm text-primary-400 hover:underline"
        >
          ← Exit Quiz
        </Link>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      {questions.length === 0 ? (
        <div className="space-y-3">
          <p className="text-[var(--text-secondary)]">No questions found for this deck.</p>
          <Link href={routes.studyDeck(params.documentId)}>
            <Button variant="secondary">Back</Button>
          </Link>
        </div>
      ) : (
        <QuizPlayer documentId={params.documentId} questions={questions} />
      )}
    </div>
  );
}
