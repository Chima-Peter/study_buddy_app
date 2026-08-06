"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPercent } from "@/lib/utils/format";
import { routes } from "@/config/routes";

export function ScoreSummary({
  documentId,
  answers,
  onRetake,
}: {
  documentId: string;
  answers: boolean[];
  onRetake: () => void;
}) {
  const correct = answers.filter(Boolean).length;
  const total = answers.length;
  const percent = formatPercent(correct, total);

  return (
    <div className="mx-auto max-w-lg space-y-8 py-10 text-center">
      <div>
        <h1 className="mt-4 text-2xl font-semibold">
          {percent >= 70 ? "Great job!" : "Keep practicing!"}
        </h1>
      </div>
      <div className="rounded-xl border border-border bg-surface-secondary p-8">
        <p className="text-5xl font-bold text-primary-700">{percent}%</p>
        <p className="mt-2 text-[var(--text-secondary)]">
          {correct} / {total} correct
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {answers.map((ok, i) => (
          <span
            key={i}
            className={
              ok
                ? "rounded-md bg-success/15 px-2 py-1 text-xs text-success"
                : "rounded-md bg-error/15 px-2 py-1 text-xs text-error"
            }
          >
            {ok ? "✓" : "✗"} Q{i + 1}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="secondary" onClick={onRetake}>
          Retake Quiz
        </Button>
        <Link href={routes.studyDeck(documentId)}>
          <Button variant="ghost">Back to Deck</Button>
        </Link>
      </div>
    </div>
  );
}
