"use client";

import { useEffect, useMemo, useState } from "react";
import type { QuizQuestion } from "@/types";
import { QuizOption } from "./quiz-option";
import { ScoreSummary } from "./score-summary";
import { Button } from "@/components/ui/button";

export type QuizPlayerQuestion = QuizQuestion & {
  explanation?: string | null;
  difficulty?: string | null;
};

export function QuizPlayer({
  documentId,
  chapterKey,
  questions,
  storagePrefix = "studybuddy_quiz",
  backHref,
  backLabel,
}: {
  documentId: string;
  chapterKey: string;
  questions: QuizPlayerQuestion[];
  storagePrefix?: string;
  backHref?: string;
  backLabel?: string;
}) {
  const storageKey = `${storagePrefix}_${documentId}_${chapterKey}`;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        index: number;
        answers: boolean[];
        done: boolean;
      };
      setIndex(parsed.index ?? 0);
      setAnswers(parsed.answers ?? []);
      setDone(!!parsed.done);
    } catch {
      // ignore
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ index, answers, done }));
  }, [storageKey, index, answers, done]);

  const question = questions[index];
  const progress = useMemo(
    () => ((index + (revealed ? 1 : 0)) / Math.max(questions.length, 1)) * 100,
    [index, revealed, questions.length],
  );

  if (!question) {
    return <p className="text-[var(--text-secondary)]">No quiz questions available.</p>;
  }

  if (done) {
    return (
      <ScoreSummary
        documentId={documentId}
        answers={answers}
        backHref={backHref}
        backLabel={backLabel}
        onRetake={() => {
          setIndex(0);
          setSelected(null);
          setRevealed(false);
          setAnswers([]);
          setDone(false);
          localStorage.removeItem(storageKey);
        }}
      />
    );
  }

  const submit = () => {
    if (selected == null) return;
    const correct = selected === question.correct_option_index;
    setRevealed(true);
    setAnswers((prev) => [...prev, correct]);
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  const explanation = question.explanation?.trim();
  const difficulty = question.difficulty?.trim();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="mb-2 flex justify-between text-sm text-[var(--text-secondary)]">
          <span>
            Question {index + 1} of {questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-tertiary">
          <div
            className="h-full bg-primary-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface-secondary p-4 sm:p-6">
        {difficulty && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-700">
            {difficulty}
          </p>
        )}
        <p className="text-base font-medium leading-relaxed sm:text-lg">{question.question}</p>
      </div>

      <div className="space-y-3">
        {question.options.map((opt, i) => (
          <QuizOption
            key={opt + i}
            label={opt}
            index={i}
            selected={selected === i}
            revealed={revealed}
            correct={i === question.correct_option_index}
            onSelect={() => setSelected(i)}
          />
        ))}
      </div>

      {revealed && explanation && (
        <div className="rounded-lg border border-primary-700/15 bg-primary-500/10 px-4 py-3 text-sm leading-relaxed text-[var(--text-primary)]">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-700">
            Explanation
          </p>
          <p>{explanation}</p>
        </div>
      )}

      <div className="sticky bottom-0 flex justify-stretch bg-surface-primary/95 py-3 backdrop-blur sm:static sm:justify-end sm:bg-transparent sm:py-0 sm:backdrop-blur-none">
        {!revealed ? (
          <Button className="w-full sm:w-auto" disabled={selected == null} onClick={submit}>
            Check answer
          </Button>
        ) : (
          <Button className="w-full sm:w-auto" onClick={next}>
            {index + 1 >= questions.length ? "See results" : "Next question"}
          </Button>
        )}
      </div>
    </div>
  );
}
