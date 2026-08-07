"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getQuestionBank,
  normalizeQuestionBankResult,
} from "@/lib/api/question-bank";
import { useQuestionBankStore } from "@/stores/question-bank-store";
import type { QuestionBank, QuestionBankQuestion } from "@/types";
import { ExamPlayer } from "@/components/question-bank/exam-player";
import { ExamSetupModal } from "@/components/question-bank/exam-setup-modal";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";

function bankFromStore(documentId: string): QuestionBank | null {
  const { current, items } = useQuestionBankStore.getState();
  if (current?.document_id === documentId && current.result != null) {
    return current;
  }
  return items.find((b) => b.document_id === documentId && b.result != null) ?? null;
}

function sampleQuestions(pool: QuestionBankQuestion[], count: number) {
  const n = Math.min(Math.max(1, count), pool.length);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

export default function QuestionBankQuizPage() {
  const params = useParams<{ documentId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const upsert = useQuestionBankStore((s) => s.upsert);
  const setCurrent = useQuestionBankStore((s) => s.setCurrent);
  const [pool, setPool] = useState<QuestionBankQuestion[]>([]);
  const [loading, setLoading] = useState(() => !bankFromStore(params.documentId));
  const [found, setFound] = useState(true);
  const [examKey, setExamKey] = useState(0);
  const [setupOpen, setSetupOpen] = useState(false);
  const [startingExam, setStartingExam] = useState(false);

  const requestedCount = Number(searchParams.get("count"));
  const hasValidCount =
    Number.isFinite(requestedCount) && requestedCount >= 1;
  const timerParam = searchParams.get("timer");
  const timerMinutes =
    timerParam != null && Number.isFinite(Number(timerParam)) && Number(timerParam) > 0
      ? Math.floor(Number(timerParam))
      : null;

  useEffect(() => {
    let cancelled = false;

    const apply = (bank: QuestionBank) => {
      if (bank.status !== "success") {
        setFound(false);
        setPool([]);
        return;
      }
      setFound(true);
      setPool(normalizeQuestionBankResult(bank.result));
    };

    (async () => {
      const cached = bankFromStore(params.documentId);
      if (cached) {
        apply(cached);
        setLoading(false);
        return;
      }

      try {
        const bank = await getQuestionBank(params.documentId);
        if (cancelled) return;
        upsert(bank);
        setCurrent(bank);
        apply(bank);
      } catch {
        if (!cancelled) {
          setFound(false);
          setPool([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params.documentId, upsert, setCurrent]);

  useEffect(() => {
    if (!loading && found && pool.length > 0 && !hasValidCount) {
      setSetupOpen(true);
    }
  }, [loading, found, pool.length, hasValidCount]);

  const examQuestions = useMemo(() => {
    if (!hasValidCount || pool.length === 0) return [];
    return sampleQuestions(pool, requestedCount);
    // Re-sample when examKey bumps (retake) or count/pool changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasValidCount, requestedCount, pool, examKey]);

  const backHref = routes.questionBankDetail(params.documentId);

  if (loading || (startingExam && examQuestions.length === 0)) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Exam" showBack backHref={backHref} />
      {!found ? (
        <div className="space-y-3">
          <p className="text-[var(--text-secondary)]">
            Question bank not found or not ready yet.
          </p>
          <Link href={backHref}>
            <Button variant="secondary">Back</Button>
          </Link>
        </div>
      ) : pool.length === 0 ? (
        <div className="space-y-3">
          <p className="text-[var(--text-secondary)]">
            No quiz questions in this bank yet.
          </p>
          <Link href={backHref}>
            <Button variant="secondary">Back</Button>
          </Link>
        </div>
      ) : examQuestions.length > 0 ? (
        <ExamPlayer
          key={examKey}
          documentId={params.documentId}
          questions={examQuestions}
          timerMinutes={timerMinutes}
          backHref={backHref}
          backLabel="Back to Bank"
          onRetake={() => {
            setSetupOpen(true);
            router.replace(routes.questionBankQuiz(params.documentId));
          }}
        />
      ) : (
        <div className="space-y-3 py-8 text-center">
          <p className="text-[var(--text-secondary)]">
            Choose how many questions to include in this exam.
          </p>
          <Button
            className="rounded-full bg-[#0f766e] hover:bg-[#0d9488]"
            onClick={() => setSetupOpen(true)}
          >
            Select count
          </Button>
        </div>
      )}

      <ExamSetupModal
        open={setupOpen}
        onOpenChange={setSetupOpen}
        total={pool.length}
        onStart={({ count, timerMinutes }) => {
          setStartingExam(true);
          setSetupOpen(false);
          setExamKey((k) => k + 1);
          const qs = new URLSearchParams({ count: String(count) });
          if (timerMinutes != null) qs.set("timer", String(timerMinutes));
          router.replace(
            `${routes.questionBankQuiz(params.documentId)}?${qs}`,
          );
        }}
      />
    </div>
  );
}
