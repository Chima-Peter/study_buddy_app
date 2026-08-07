"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Link2 } from "lucide-react";
import type { QuestionBankQuestion } from "@/types";
import { Button } from "@/components/ui/button";
import { formatPercent } from "@/lib/utils/format";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";

function QuestionReview({
  question,
  index,
  selected,
}: {
  question: QuestionBankQuestion;
  index: number;
  selected: number | null;
}) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showReferences, setShowReferences] = useState(false);

  const correct = selected === question.correct_option_index;
  const explanation = question.explanation?.trim();
  const internal = question.internal_references?.filter((r) => r?.trim()) ?? [];
  const external = question.external_references?.filter((r) => r?.trim()) ?? [];
  const hasReferences = internal.length > 0 || external.length > 0;

  return (
    <li className="rounded-2xl border border-border bg-surface-secondary p-3.5 sm:rounded-xl sm:p-5">
      <div className="flex items-start gap-2.5 sm:gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            correct
              ? "bg-success/15 text-success"
              : "bg-error/15 text-error",
          )}
        >
          {correct ? "✓" : "✗"}
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              Q{index + 1}
              {question.difficulty?.trim()
                ? ` · ${question.difficulty.trim()}`
                : ""}
            </p>
            <p className="mt-1 text-[15px] font-medium leading-relaxed text-[var(--text-primary)] sm:text-base">
              {question.question}
            </p>
          </div>

          <ul className="space-y-1.5">
            {question.options.map((opt, i) => {
              const isCorrect = i === question.correct_option_index;
              const isSelected = selected === i;
              return (
                <li
                  key={opt + i}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm leading-snug sm:rounded-lg sm:py-2",
                    isCorrect && "border-success/40 bg-success/10 text-success-dark",
                    isSelected &&
                      !isCorrect &&
                      "border-error/40 bg-error/10 text-error-dark",
                    !isCorrect &&
                      !isSelected &&
                      "border-transparent bg-surface-tertiary/60 text-[var(--text-secondary)]",
                  )}
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span>
                      <span className="font-semibold">
                        {String.fromCharCode(65 + i)}.
                      </span>{" "}
                      {opt}
                    </span>
                    {isCorrect && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide">
                        Correct
                      </span>
                    )}
                    {isSelected && !isCorrect && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide">
                        Yours
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="grid grid-cols-1 gap-2 pt-0.5 sm:grid-cols-2">
            <Button
              size="sm"
              variant="secondary"
              className="w-full rounded-full"
              disabled={!explanation}
              onClick={() => setShowExplanation((v) => !v)}
            >
              <BookOpen className="h-3.5 w-3.5" />
              {showExplanation ? "Hide explanation" : "Explanation"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="w-full rounded-full"
              disabled={!hasReferences}
              onClick={() => setShowReferences((v) => !v)}
            >
              <Link2 className="h-3.5 w-3.5" />
              {showReferences ? "Hide references" : "References"}
            </Button>
          </div>

          {showExplanation && explanation && (
            <div className="rounded-xl border border-[#0f766e]/15 bg-[#0f766e]/5 px-3.5 py-3 text-sm leading-relaxed text-[var(--text-primary)]">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f766e]">
                Explanation
              </p>
              <p className="break-words">{explanation}</p>
            </div>
          )}

          {showReferences && hasReferences && (
            <div className="space-y-3 rounded-xl border border-border bg-surface-primary/80 px-3.5 py-3 text-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f766e]">
                References
              </p>
              {internal.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium text-[var(--text-secondary)]">
                    Internal
                  </p>
                  <ul className="list-disc space-y-1.5 break-words pl-4 text-[var(--text-primary)]">
                    {internal.map((ref, i) => (
                      <li key={`in-${i}`}>{ref}</li>
                    ))}
                  </ul>
                </div>
              )}
              {external.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium text-[var(--text-secondary)]">
                    External
                  </p>
                  <ul className="list-disc space-y-1.5 break-words pl-4 text-[var(--text-primary)]">
                    {external.map((ref, i) => {
                      const url =
                        /^https?:\/\//i.test(ref.trim()) ? ref.trim() : null;
                      return (
                        <li key={`ex-${i}`}>
                          {url ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0f766e] underline-offset-2 hover:underline"
                            >
                              {ref}
                            </a>
                          ) : (
                            ref
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function ExamResults({
  documentId,
  questions,
  answers,
  onRetake,
  backHref,
  backLabel = "Back to Bank",
}: {
  documentId: string;
  questions: QuestionBankQuestion[];
  answers: (number | null)[];
  onRetake: () => void;
  backHref?: string;
  backLabel?: string;
}) {
  const correct = questions.filter(
    (q, i) => answers[i] === q.correct_option_index,
  ).length;
  const total = questions.length;
  const percent = formatPercent(correct, total);
  const href = backHref ?? routes.questionBankDetail(documentId);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:space-y-8 sm:pb-10">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
          {percent >= 70 ? "Exam complete" : "Exam marked"}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Review each question below
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface-secondary px-5 py-7 text-center sm:rounded-xl sm:p-8">
        <p className="text-4xl font-bold text-[#0f766e] sm:text-5xl">{percent}%</p>
        <p className="mt-2 text-sm text-[var(--text-secondary)] sm:text-base">
          {correct} / {total} correct
        </p>
      </div>

      <ol className="space-y-3 sm:space-y-4">
        {questions.map((q, i) => (
          <QuestionReview
            key={`${q.question.slice(0, 32)}-${i}`}
            question={q}
            index={i}
            selected={answers[i] ?? null}
          />
        ))}
      </ol>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
        <Link href={href} className="w-full sm:w-auto">
          <Button variant="ghost" className="w-full rounded-full sm:w-auto">
            {backLabel}
          </Button>
        </Link>
        <Button
          variant="secondary"
          className="w-full rounded-full sm:w-auto"
          onClick={onRetake}
        >
          Retake exam
        </Button>
      </div>
    </div>
  );
}
