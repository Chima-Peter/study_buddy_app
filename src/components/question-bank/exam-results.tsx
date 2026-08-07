"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import {
  Check,
  X,
  ChevronDown,
  BookOpen,
  ExternalLink,
  Target,
  TrendingUp,
} from "lucide-react";
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

type FilterTab = "all" | "incorrect" | "correct";

function ScoreRing({
  percent,
  size = 120,
  strokeWidth = 10,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const passed = percent >= 70;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-[#0f766e]/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            "transition-[stroke-dashoffset] duration-700 ease-out",
            passed ? "text-[#0f766e]" : "text-[#f59e0b]",
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-[family-name:var(--font-study-display)] text-3xl font-bold tracking-tight",
            passed ? "text-[#0f766e]" : "text-[#f59e0b]",
          )}
        >
          {percent}%
        </span>
      </div>
    </div>
  );
}

function DifficultyBreakdown({
  questions,
  answers,
}: {
  questions: QuestionBankQuestion[];
  answers: (number | null)[];
}) {
  const stats = useMemo(() => {
    const map: Record<string, { total: number; correct: number }> = {};
    questions.forEach((q, i) => {
      const diff = (q.difficulty?.trim() || "Unknown").toLowerCase();
      const label =
        diff === "easy"
          ? "Easy"
          : diff === "medium"
            ? "Medium"
            : diff === "hard"
              ? "Hard"
              : "Other";
      if (!map[label]) map[label] = { total: 0, correct: 0 };
      map[label].total++;
      if (answers[i] === q.correct_option_index) map[label].correct++;
    });
    const order = ["Easy", "Medium", "Hard", "Other"];
    return order
      .filter((k) => map[k])
      .map((label) => ({ label, ...map[label] }));
  }, [questions, answers]);

  if (stats.length <= 1) return null;

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {stats.map(({ label, total, correct }) => {
        const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
        return (
          <div
            key={label}
            className="rounded-xl border border-[#0c2420]/08 bg-white/60 p-3 text-center sm:p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5a7a73]">
              {label}
            </p>
            <p className="mt-1 font-[family-name:var(--font-study-display)] text-lg font-bold text-[#0c2420] sm:text-xl">
              {correct}/{total}
            </p>
            <div className="mx-auto mt-2 h-1.5 w-full max-w-[60px] overflow-hidden rounded-full bg-[#0f766e]/10">
              <div
                className="h-full rounded-full bg-[#0f766e] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QuestionReview({
  question,
  index,
  selected,
  defaultExpanded = false,
}: {
  question: QuestionBankQuestion;
  index: number;
  selected: number | null;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const correct = selected === question.correct_option_index;
  const explanation = question.explanation?.trim();
  const internal =
    question.internal_references?.filter((r) => r?.trim()) ?? [];
  const external =
    question.external_references?.filter((r) => r?.trim()) ?? [];
  const hasReferences = internal.length > 0 || external.length > 0;
  const hasDetails = !!explanation || hasReferences;

  return (
    <li
      className={cn(
        "group overflow-hidden rounded-2xl border bg-white transition-shadow sm:rounded-xl",
        correct
          ? "border-[#0f766e]/20 hover:shadow-[0_4px_20px_rgba(15,118,110,0.08)]"
          : "border-[#f87171]/25 hover:shadow-[0_4px_20px_rgba(248,113,113,0.08)]",
      )}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8",
              correct ? "bg-[#0f766e]/10" : "bg-[#f87171]/10",
            )}
          >
            {correct ? (
              <Check
                className="h-4 w-4 text-[#0f766e] sm:h-[18px] sm:w-[18px]"
                strokeWidth={2.5}
              />
            ) : (
              <X
                className="h-4 w-4 text-[#dc2626] sm:h-[18px] sm:w-[18px]"
                strokeWidth={2.5}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-[#0f766e]/8 px-2 py-0.5 text-[11px] font-semibold text-[#0f766e]">
                Q{index + 1}
              </span>
              {question.difficulty?.trim() && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
                    question.difficulty.toLowerCase() === "easy" &&
                      "bg-emerald-500/10 text-emerald-700",
                    question.difficulty.toLowerCase() === "medium" &&
                      "bg-amber-500/10 text-amber-700",
                    question.difficulty.toLowerCase() === "hard" &&
                      "bg-rose-500/10 text-rose-700",
                    !["easy", "medium", "hard"].includes(
                      question.difficulty.toLowerCase(),
                    ) && "bg-slate-500/10 text-slate-600",
                  )}
                >
                  {question.difficulty.trim()}
                </span>
              )}
            </div>

            <p className="mt-2 font-[family-name:var(--font-study-display)] text-[15px] font-semibold leading-snug tracking-tight text-[#0c2420] sm:text-base">
              {question.question}
            </p>

            <ul className="mt-4 space-y-2">
              {question.options.map((opt, i) => {
                const isCorrect = i === question.correct_option_index;
                const isSelected = selected === i;
                const isWrong = isSelected && !isCorrect;

                return (
                  <li
                    key={opt + i}
                    className={cn(
                      "flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors sm:text-[15px]",
                      isCorrect && "bg-[#0f766e]/8",
                      isWrong && "bg-[#f87171]/8",
                      !isCorrect && !isSelected && "bg-transparent",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        isCorrect &&
                          "bg-[#0f766e] text-white",
                        isWrong &&
                          "bg-[#dc2626] text-white",
                        !isCorrect &&
                          !isSelected &&
                          "border border-[#0c2420]/15 text-[#5a7a73]",
                      )}
                    >
                      {isCorrect ? (
                        <Check className="h-3 w-3" strokeWidth={3} />
                      ) : isWrong ? (
                        <X className="h-3 w-3" strokeWidth={3} />
                      ) : (
                        String.fromCharCode(65 + i)
                      )}
                    </span>
                    <span
                      className={cn(
                        "flex-1 leading-snug",
                        isCorrect && "font-medium text-[#0f766e]",
                        isWrong && "text-[#b91c1c]",
                        !isCorrect && !isSelected && "text-[#3d5a54]",
                      )}
                    >
                      {opt}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {hasDetails && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#0c2420]/08 bg-[#f7fffc] py-2 text-sm font-medium text-[#0f766e] transition-colors hover:bg-[#0f766e]/8"
          >
            {expanded ? "Hide details" : "Show explanation"}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                expanded && "rotate-180",
              )}
            />
          </button>
        )}
      </div>

      {expanded && hasDetails && (
        <div className="border-t border-[#0c2420]/08 bg-[#f7fffc]/60 px-4 py-4 sm:px-5">
          {explanation && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#0f766e]">
                <BookOpen className="h-3.5 w-3.5" />
                Explanation
              </div>
              <p className="text-sm leading-relaxed text-[#3d5a54]">
                {explanation}
              </p>
            </div>
          )}

          {hasReferences && (
            <div className={cn(explanation && "mt-4 border-t border-[#0c2420]/08 pt-4")}>
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#0f766e]">
                <ExternalLink className="h-3.5 w-3.5" />
                References
              </div>
              <ul className="space-y-1.5 text-sm text-[#3d5a54]">
                {[...internal, ...external].map((ref, i) => {
                  const url = /^https?:\/\//i.test(ref.trim())
                    ? ref.trim()
                    : null;
                  return (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0f766e]/40" />
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
                        <span>{ref}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
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
  const [filter, setFilter] = useState<FilterTab>("all");

  const correctCount = questions.filter(
    (q, i) => answers[i] === q.correct_option_index,
  ).length;
  const incorrectCount = questions.length - correctCount;
  const total = questions.length;
  const percent = formatPercent(correctCount, total);
  const passed = percent >= 70;
  const href = backHref ?? routes.questionBankDetail(documentId);

  const filteredQuestions = useMemo(() => {
    return questions
      .map((q, i) => ({ question: q, index: i, selected: answers[i] ?? null }))
      .filter(({ question, selected }) => {
        const isCorrect = selected === question.correct_option_index;
        if (filter === "correct") return isCorrect;
        if (filter === "incorrect") return !isCorrect;
        return true;
      });
  }, [questions, answers, filter]);

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "all", label: "All", count: total },
    { id: "incorrect", label: "Incorrect", count: incorrectCount },
    { id: "correct", label: "Correct", count: correctCount },
  ];

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-2xl pb-[calc(1.5rem+env(safe-area-inset-bottom))] font-[family-name:var(--font-study-sans)] sm:pb-10",
        display.variable,
        sans.variable,
      )}
    >
      {/* Score Summary Card */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-[#0c2420]/08 bg-gradient-to-b from-white to-[#f7fffc] p-5 shadow-sm sm:mb-8 sm:rounded-xl sm:p-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
          <ScoreRing percent={percent} />

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              {passed ? (
                <Target className="h-5 w-5 text-[#0f766e]" />
              ) : (
                <TrendingUp className="h-5 w-5 text-[#f59e0b]" />
              )}
              <h1 className="font-[family-name:var(--font-study-display)] text-xl font-semibold tracking-tight text-[#0c2420] sm:text-2xl">
                {passed ? "Great work!" : "Keep practicing"}
              </h1>
            </div>
            <p className="mt-1.5 text-sm text-[#5a7a73] sm:text-base">
              You got{" "}
              <span className="font-semibold text-[#0f766e]">
                {correctCount}
              </span>{" "}
              out of{" "}
              <span className="font-semibold text-[#0c2420]">{total}</span>{" "}
              questions correct
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Link href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-[#5a7a73]"
                >
                  {backLabel}
                </Button>
              </Link>
              <Button
                size="sm"
                className="rounded-full bg-[#0f766e] hover:bg-[#0d9488]"
                onClick={onRetake}
              >
                Retake exam
              </Button>
            </div>
          </div>
        </div>

        {/* Difficulty breakdown */}
        <div className="mt-5 border-t border-[#0c2420]/08 pt-5">
          <DifficultyBreakdown questions={questions} answers={answers} />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 flex items-center gap-1 rounded-xl border border-[#0c2420]/08 bg-[#f7fffc] p-1 sm:mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              filter === tab.id
                ? "bg-white text-[#0c2420] shadow-sm"
                : "text-[#5a7a73] hover:text-[#0c2420]",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-xs tabular-nums",
                filter === tab.id
                  ? "bg-[#0f766e]/10 text-[#0f766e]"
                  : "bg-[#0c2420]/5 text-[#5a7a73]",
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Question List */}
      {filteredQuestions.length === 0 ? (
        <div className="rounded-xl border border-[#0c2420]/08 bg-white p-8 text-center">
          <p className="text-sm text-[#5a7a73]">
            {filter === "incorrect"
              ? "No incorrect answers — great job!"
              : filter === "correct"
                ? "No correct answers yet"
                : "No questions to display"}
          </p>
        </div>
      ) : (
        <ol className="space-y-3 sm:space-y-4">
          {filteredQuestions.map(({ question, index, selected }) => (
            <QuestionReview
              key={`${question.question.slice(0, 32)}-${index}`}
              question={question}
              index={index}
              selected={selected}
              defaultExpanded={filter === "incorrect"}
            />
          ))}
        </ol>
      )}
    </div>
  );
}
