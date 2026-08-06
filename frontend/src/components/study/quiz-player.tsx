"use client";

import { useEffect, useMemo, useState } from "react";
import type { QuizQuestion } from "@/types";
import { QuizOption } from "./quiz-option";
import { ScoreSummary } from "./score-summary";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = (documentId: string) => `studybuddy_quiz_${documentId}`;

export function QuizPlayer({
  documentId,
  questions,
}: {
  documentId: string;
  questions: QuizQuestion[];
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(documentId));
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
  }, [documentId]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY(documentId),
      JSON.stringify({ index, answers, done }),
    );
  }, [documentId, index, answers, done]);

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
        onRetake={() => {
          setIndex(0);
          setSelected(null);
          setRevealed(false);
          setAnswers([]);
          setDone(false);
          localStorage.removeItem(STORAGE_KEY(documentId));
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

      <div className="rounded-lg border border-border bg-surface-secondary p-6">
        <p className="text-lg font-medium leading-relaxed">{question.question}</p>
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

      <div className="flex justify-end">
        {!revealed ? (
          <Button disabled={selected == null} onClick={submit}>
            Check answer
          </Button>
        ) : (
          <Button onClick={next}>
            {index + 1 >= questions.length ? "See results" : "Next question"}
          </Button>
        )}
      </div>
    </div>
  );
}
