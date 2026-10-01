"use client";

import type { QuestionBankQuestion } from "@/types";
import { cn } from "@/lib/utils/cn";

export function QuestionPreviewList({
  questions,
}: {
  questions: QuestionBankQuestion[];
}) {
  const list = Array.isArray(questions) ? questions : [];

  if (list.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-panel/80 px-4 py-10 text-center text-sm text-muted">
        No questions in this bank yet.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {list.map((q, i) => {
        const difficulty = q.difficulty?.trim();
        return (
          <li
            key={`${q.question.slice(0, 40)}-${i}`}
            className="rounded-xl border border-border bg-surface-secondary px-4 py-3.5"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-xs font-semibold text-brand">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                {difficulty && (
                  <p
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.12em]",
                      difficulty.toLowerCase() === "easy" && "text-success",
                      difficulty.toLowerCase() === "hard" && "text-error",
                      difficulty.toLowerCase() === "medium" && "text-warning",
                      !["easy", "medium", "hard"].includes(difficulty.toLowerCase()) &&
                        "text-brand",
                    )}
                  >
                    {difficulty}
                  </p>
                )}
                <p className="text-sm font-medium leading-relaxed text-[var(--text-primary)]">
                  {q.question}
                </p>
                <p className="text-xs text-muted">
                  {q.options.length} options
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
