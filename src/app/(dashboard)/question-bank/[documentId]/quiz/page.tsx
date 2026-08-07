"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getQuestionBank } from "@/lib/api/question-bank";
import type { QuestionBankQuestion } from "@/types";
import { QuizPlayer } from "@/components/study/quiz-player";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";

export default function QuestionBankQuizPage() {
  const params = useParams<{ documentId: string }>();
  const [questions, setQuestions] = useState<QuestionBankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [found, setFound] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const bank = await getQuestionBank(params.documentId);
        if (cancelled) return;
        if (bank.status !== "success") {
          setFound(false);
          setQuestions([]);
          return;
        }
        setFound(true);
        setQuestions(bank.result ?? []);
      } catch {
        if (!cancelled) {
          setFound(false);
          setQuestions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.documentId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const backHref = routes.questionBankDetail(params.documentId);

  return (
    <div className="space-y-6">
      <PageHeader title="Quiz" showBack backHref={backHref} />
      {!found ? (
        <div className="space-y-3">
          <p className="text-[var(--text-secondary)]">
            Question bank not found or not ready yet.
          </p>
          <Link href={backHref}>
            <Button variant="secondary">Back</Button>
          </Link>
        </div>
      ) : questions.length === 0 ? (
        <div className="space-y-3">
          <p className="text-[var(--text-secondary)]">
            No quiz questions in this bank yet.
          </p>
          <Link href={backHref}>
            <Button variant="secondary">Back</Button>
          </Link>
        </div>
      ) : (
        <QuizPlayer
          documentId={params.documentId}
          chapterKey="all"
          questions={questions}
          storagePrefix="studybuddy_qbank_quiz"
          backHref={backHref}
          backLabel="Back to Bank"
        />
      )}
    </div>
  );
}
