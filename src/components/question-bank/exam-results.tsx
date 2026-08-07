"use client";

import { useState } from "react";
import Link from "next/link";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import type { QuestionBankQuestion } from "@/types";
import { Button } from "@/components/ui/button";
import { formatPercent } from "@/lib/utils/format";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-study-display",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-study-sans",
});

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
    <li className="relative py-6 pl-4 sm:py-8 sm:pl-5">
      <div
        className={cn(
          "absolute left-0 top-7 bottom-7 w-1 rounded-full sm:top-9 sm:bottom-9",
          correct ? "bg-[#14b8a6]" : "bg-[#f87171]",
        )}
        aria-hidden
      />

      <div className="space-y-4">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5a7a73]">
              Q{index + 1}
              {question.difficulty?.trim()
                ? ` · ${question.difficulty.trim()}`
                : ""}
            </p>
            <span
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.12em]",
                correct ? "text-[#0f766e]" : "text-[#b91c1c]",
              )}
            >
              {correct ? "Correct" : "Incorrect"}
            </span>
          </div>
          <p className="mt-2 font-[family-name:var(--font-study-display)] text-lg font-semibold leading-snug tracking-tight text-[#0c2420] sm:text-xl">
            {question.question}
          </p>
        </div>

        <ul className="space-y-2.5">
          {question.options.map((opt, i) => {
            const isCorrect = i === question.correct_option_index;
            const isSelected = selected === i;
            return (
              <li
                key={opt + i}
                className={cn(
                  "flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm leading-snug sm:text-[15px]",
                  isCorrect && "font-medium text-[#0f766e]",
                  isSelected && !isCorrect && "font-medium text-[#b91c1c]",
                  !isCorrect &&
                    !isSelected &&
                    "text-[#5a7a73]",
                )}
              >
                <span>
                  <span className="font-semibold tabular-nums">
                    {String.fromCharCode(65 + i)}.
                  </span>{" "}
                  {opt}
                </span>
                {isCorrect && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0f766e]">
                    Correct
                  </span>
                )}
                {isSelected && !isCorrect && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#b91c1c]">
                    Yours
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <button
            type="button"
            disabled={!explanation}
            onClick={() => setShowExplanation((v) => !v)}
            className="min-h-11 text-sm font-medium text-[#0f766e] underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-40"
          >
            {showExplanation ? "Hide explanation" : "Explanation"}
          </button>
          <button
            type="button"
            disabled={!hasReferences}
            onClick={() => setShowReferences((v) => !v)}
            className="min-h-11 text-sm font-medium text-[#0f766e] underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-40"
          >
            {showReferences ? "Hide references" : "References"}
          </button>
        </div>

        {showExplanation && explanation && (
          <div className="border-t border-[#0c2420]/08 pt-3 text-sm leading-relaxed text-[#0c2420]">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f766e]">
              Explanation
            </p>
            <p className="break-words text-[#3d5a54]">{explanation}</p>
          </div>
        )}

        {showReferences && hasReferences && (
          <div className="space-y-3 border-t border-[#0c2420]/08 pt-3 text-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f766e]">
              References
            </p>
            {internal.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-[#5a7a73]">
                  Internal
                </p>
                <ul className="list-disc space-y-1.5 break-words pl-4 text-[#3d5a54]">
                  {internal.map((ref, i) => (
                    <li key={`in-${i}`}>{ref}</li>
                  ))}
                </ul>
              </div>
            )}
            {external.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-[#5a7a73]">
                  External
                </p>
                <ul className="list-disc space-y-1.5 break-words pl-4 text-[#3d5a54]">
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
    <div
      className={cn(
        "mx-auto w-full max-w-2xl space-y-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))] font-[family-name:var(--font-study-sans)] sm:space-y-10 sm:pb-10",
        display.variable,
        sans.variable,
      )}
    >
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-study-display)] text-2xl font-semibold tracking-tight text-[#0c2420] sm:text-3xl">
          {percent >= 70 ? "Exam complete" : "Exam marked"}
        </h1>
        <p className="mt-1.5 text-sm text-[#5a7a73]">
          Review each question below
        </p>
      </div>

      <div className="text-center">
        <p className="font-[family-name:var(--font-study-display)] text-5xl font-semibold tracking-tight text-[#0f766e] sm:text-6xl">
          {percent}%
        </p>
        <p className="mt-2 text-sm text-[#5a7a73] sm:text-base">
          {correct} / {total} correct
        </p>
      </div>

      <ol className="divide-y divide-[#0c2420]/08 border-y border-[#0c2420]/08">
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
          className="w-full rounded-full border-[#0f766e]/30 text-[#0f766e] sm:w-auto"
          onClick={onRetake}
        >
          Retake exam
        </Button>
      </div>
    </div>
  );
}
