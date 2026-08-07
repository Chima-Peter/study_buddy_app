"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock } from "lucide-react";
import type { QuestionBankQuestion } from "@/types";
import { QuizOption } from "@/components/study/quiz-option";
import { Button } from "@/components/ui/button";
import { ExamResults } from "./exam-results";
import { cn } from "@/lib/utils/cn";

function formatClock(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function ExamPlayer({
  documentId,
  questions,
  timerMinutes = null,
  backHref,
  backLabel,
  onRetake,
}: {
  documentId: string;
  questions: QuestionBankQuestion[];
  /** Exam duration in minutes; null disables the timer. */
  timerMinutes?: number | null;
  backHref?: string;
  backLabel?: string;
  onRetake: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    questions.map(() => null),
  );
  const [done, setDone] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() =>
    timerMinutes != null && timerMinutes > 0 ? timerMinutes * 60 : null,
  );

  const selectedRef = useRef(selected);
  const indexRef = useRef(index);
  const answersRef = useRef(answers);
  const doneRef = useRef(done);
  selectedRef.current = selected;
  indexRef.current = index;
  answersRef.current = answers;
  doneRef.current = done;

  const submitExam = (finalAnswers: (number | null)[]) => {
    if (doneRef.current) return;
    setAnswers(finalAnswers);
    setDone(true);
  };

  useEffect(() => {
    if (secondsLeft == null || done) return;

    if (secondsLeft <= 0) {
      const next = [...answersRef.current];
      if (selectedRef.current != null) {
        next[indexRef.current] = selectedRef.current;
      }
      submitExam(next);
      return;
    }

    const id = window.setTimeout(() => {
      setSecondsLeft((s) => (s == null ? s : s - 1));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft, done]);

  const question = questions[index];
  const progress = useMemo(
    () => ((index + (selected != null ? 1 : 0)) / Math.max(questions.length, 1)) * 100,
    [index, selected, questions.length],
  );
  const answeredCount = answers.reduce((n, a, i) => {
    if (i === index) return n + (selected != null ? 1 : 0);
    return n + (a != null ? 1 : 0);
  }, 0);

  const timerUrgent = secondsLeft != null && secondsLeft <= 60;

  if (!question) {
    return (
      <p className="text-[var(--text-secondary)]">No exam questions available.</p>
    );
  }

  if (done) {
    return (
      <ExamResults
        documentId={documentId}
        questions={questions}
        answers={answers}
        backHref={backHref}
        backLabel={backLabel}
        onRetake={onRetake}
      />
    );
  }

  const goNext = () => {
    if (selected == null) return;
    const nextAnswers = [...answers];
    nextAnswers[index] = selected;
    setAnswers(nextAnswers);

    if (index + 1 >= questions.length) {
      submitExam(nextAnswers);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(nextAnswers[index + 1]);
  };

  const goPrev = () => {
    if (index <= 0) return;
    const nextAnswers = [...answers];
    if (selected != null) nextAnswers[index] = selected;
    setAnswers(nextAnswers);
    setIndex((i) => i - 1);
    setSelected(nextAnswers[index - 1]);
  };

  const isLast = index + 1 >= questions.length;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:pb-0">
      <div className="sticky top-0 z-20 -mx-4 border-b border-border/60 bg-surface-primary/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {index + 1}
              <span className="font-normal text-[var(--text-secondary)]">
                {" "}
                / {questions.length}
              </span>
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {answeredCount} answered
            </p>
          </div>
          {secondsLeft != null && (
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold tabular-nums",
                timerUrgent
                  ? "border-error/40 bg-error/10 text-error"
                  : "border-[#0f766e]/25 bg-[#0f766e]/10 text-[#0f766e]",
              )}
              aria-live="polite"
              aria-label={`Time remaining ${formatClock(secondsLeft)}`}
            >
              <Clock className="h-4 w-4" />
              {formatClock(secondsLeft)}
            </span>
          )}
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-tertiary sm:h-2">
          <div
            className="h-full bg-[#0f766e] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-4 sm:mt-6 sm:space-y-6">
        <div className="rounded-2xl border border-border bg-surface-secondary p-4 sm:rounded-lg sm:p-6">
          {question.difficulty?.trim() && (
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f766e]">
              {question.difficulty.trim()}
            </p>
          )}
          <p className="text-[15px] font-medium leading-relaxed sm:text-lg">
            {question.question}
          </p>
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          {question.options.map((opt, i) => (
            <QuizOption
              key={opt + i}
              label={opt}
              index={i}
              selected={selected === i}
              revealed={false}
              correct={false}
              onSelect={() => setSelected(i)}
            />
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-surface-primary/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-2xl gap-2">
          <Button
            variant="secondary"
            className="min-w-[6.5rem] flex-1 rounded-full sm:flex-none"
            disabled={index === 0}
            onClick={goPrev}
          >
            Prev
          </Button>
          <Button
            className="flex-[1.4] rounded-full bg-[#0f766e] hover:bg-[#0d9488] sm:flex-1"
            disabled={selected == null}
            onClick={goNext}
          >
            {isLast ? "Submit" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
