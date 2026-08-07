"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getQuestionBank } from "@/lib/api/question-bank";
import { useQuestionBankStore } from "@/stores/question-bank-store";
import { QuestionPreviewList } from "@/components/question-bank/question-preview-list";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";

export default function QuestionBankDetailPage() {
  const params = useParams<{ documentId: string }>();
  const setCurrent = useQuestionBankStore((s) => s.setCurrent);
  const upsert = useQuestionBankStore((s) => s.upsert);
  const current = useQuestionBankStore((s) => s.current);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const bank = await getQuestionBank(params.documentId);
        if (cancelled) return;
        setCurrent(bank);
        upsert(bank);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.documentId, setCurrent, upsert]);

  const questions = current?.result ?? [];
  const questionCount = questions.length;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!current || current.status !== "success") {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Question bank unavailable"
          showBack
          backHref={routes.questionBank}
        />
        <p className="text-[var(--text-secondary)]">
          Questions may still be generating, or generation failed. Check the Quizzes
          index.
        </p>
        <Link href={routes.questionBank}>
          <Button variant="secondary">Back to banks</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={current.document_name?.trim() || "Question Bank"}
        description={`${questionCount} question${questionCount === 1 ? "" : "s"}`}
        showBack
        backHref={routes.questionBank}
        actions={
          questionCount > 0 ? (
            <Link
              href={routes.questionBankQuiz(params.documentId)}
              className="w-full sm:w-auto"
            >
              <Button className="w-full sm:w-auto">Take quiz</Button>
            </Link>
          ) : undefined
        }
      />

      <QuestionPreviewList questions={questions} />
    </div>
  );
}
