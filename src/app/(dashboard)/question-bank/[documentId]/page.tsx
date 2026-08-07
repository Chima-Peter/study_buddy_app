"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ClipboardList,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import {
  generateQuestionBank,
  getQuestionBank,
  normalizeQuestionBankResult,
} from "@/lib/api/question-bank";
import { useQuestionBankStore } from "@/stores/question-bank-store";
import { QuestionPreviewList } from "@/components/question-bank/question-preview-list";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/layout/page-header";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";
import type { QuestionBankStatus } from "@/types";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-study-display",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-study-sans",
});

function statusCopy(status: QuestionBankStatus | null) {
  if (status === "pending") {
    return {
      eyebrow: "Generating",
      title: "Quiz is on the way",
      body: "We’re building a shuffled question bank from your document. This page will update when it’s ready — or check Quizzes shortly.",
      accent: "pending" as const,
    };
  }
  if (status === "failed") {
    return {
      eyebrow: "Failed",
      title: "Generation didn’t finish",
      body: "Something went wrong while creating this quiz. You can retry, or return to Quizzes and try another document.",
      accent: "failed" as const,
    };
  }
  return {
    eyebrow: "Unavailable",
    title: "Question bank not found",
    body: "This quiz isn’t ready yet, or it was removed. Head back to Quizzes to open a ready bank or start a new one.",
    accent: "missing" as const,
  };
}

function bankFromStore(documentId: string) {
  const { current, items } = useQuestionBankStore.getState();
  if (current?.document_id === documentId && current.result != null) {
    return current;
  }
  return items.find((b) => b.document_id === documentId && b.result != null) ?? null;
}

export default function QuestionBankDetailPage() {
  const params = useParams<{ documentId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const setCurrent = useQuestionBankStore((s) => s.setCurrent);
  const upsert = useQuestionBankStore((s) => s.upsert);
  const current = useQuestionBankStore((s) => s.current);
  const [loading, setLoading] = useState(
    () => !bankFromStore(params.documentId),
  );
  const [retrying, setRetrying] = useState(false);

  const bankMatches =
    current?.document_id === params.documentId ? current : null;

  useEffect(() => {
    let cancelled = false;

    const apply = (bank: NonNullable<ReturnType<typeof bankFromStore>>) => {
      setCurrent(bank);
      upsert(bank);
    };

    (async () => {
      const cached = bankFromStore(params.documentId);
      if (cached) {
        apply(cached);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const bank = await getQuestionBank(params.documentId);
        if (cancelled) return;
        apply(bank);
      } catch {
        if (!cancelled) setCurrent(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params.documentId, setCurrent, upsert]);

  const questions = normalizeQuestionBankResult(bankMatches?.result);
  const questionCount = questions.length;
  const status = bankMatches?.status ?? null;
  const copy = statusCopy(status);

  const onRetry = async () => {
    setRetrying(true);
    try {
      await generateQuestionBank(params.documentId);
      upsert({
        id: params.documentId,
        document_id: params.documentId,
        document_name: bankMatches?.document_name ?? null,
        status: "pending",
        result: null,
        created_at: bankMatches?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setCurrent({
        id: params.documentId,
        document_id: params.documentId,
        document_name: bankMatches?.document_name ?? null,
        status: "pending",
        result: null,
        created_at: bankMatches?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      toast({ title: "Regeneration queued", variant: "success" });
    } catch (err) {
      toast({
        title: "Could not regenerate",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!bankMatches || bankMatches.status !== "success") {
    const Icon =
      copy.accent === "pending"
        ? Loader2
        : copy.accent === "failed"
          ? AlertCircle
          : ClipboardList;

    return (
      <div
        className={cn(
          "relative font-[family-name:var(--font-study-sans)]",
          display.variable,
          sans.variable,
        )}
      >
        <div
          className="pointer-events-none absolute -inset-x-4 -top-6 h-72 rounded-[2rem] opacity-90 sm:-inset-x-6"
          style={{
            background:
              copy.accent === "failed"
                ? "radial-gradient(ellipse 70% 55% at 20% 0%, rgba(248,113,113,0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 10%, rgba(240,196,25,0.1), transparent 50%)"
                : "radial-gradient(ellipse 80% 60% at 15% 0%, rgba(45,212,191,0.22), transparent 55%), radial-gradient(ellipse 60% 50% at 90% 20%, rgba(240,196,25,0.12), transparent 50%)",
          }}
          aria-hidden
        />

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
                return;
              }
              router.push(routes.questionBank);
            }}
            className="mb-2 flex min-touch items-center gap-1.5 rounded-md px-1 py-2 text-sm text-[#5a7a73] hover:bg-white/60 hover:text-[#0c2420]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
            Quizzes
          </button>

          <div className="mx-auto flex min-h-[min(58vh,32rem)] max-w-lg flex-col items-center justify-center px-2 pb-10 text-center">
            <div
              className={cn(
                "mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border shadow-sm",
                copy.accent === "failed"
                  ? "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]"
                  : copy.accent === "pending"
                    ? "border-[#fde68a] bg-[#fffbeb] text-[#b45309]"
                    : "border-[#99f6e4]/80 bg-white/80 text-[#0f766e]",
              )}
            >
              <Icon
                className={cn(
                  "h-7 w-7",
                  copy.accent === "pending" && "animate-spin",
                )}
                strokeWidth={1.75}
              />
            </div>

            <p
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.18em]",
                copy.accent === "failed" && "text-[#b91c1c]",
                copy.accent === "pending" && "text-[#b45309]",
                copy.accent === "missing" && "text-[#0f766e]",
              )}
            >
              {copy.eyebrow}
            </p>

            <h1 className="mt-3 font-[family-name:var(--font-study-display)] text-3xl font-semibold tracking-tight text-[#0c2420] sm:text-4xl">
              {copy.title}
            </h1>

            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#5a7a73] sm:text-base">
              {copy.body}
            </p>

            <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
              {status === "failed" && (
                <Button
                  onClick={onRetry}
                  disabled={retrying}
                  className="rounded-full bg-[#0f766e] hover:bg-[#0d9488]"
                >
                  <RefreshCw
                    className={cn("h-4 w-4", retrying && "animate-spin")}
                  />
                  {retrying ? "Queuing…" : "Try again"}
                </Button>
              )}
              <Link href={routes.questionBank} className="w-full sm:w-auto">
                <Button
                  variant={status === "failed" ? "secondary" : "primary"}
                  className={cn(
                    "w-full rounded-full sm:w-auto",
                    status !== "failed" && "bg-[#0f766e] hover:bg-[#0d9488]",
                    status === "failed" &&
                      "border-[#0f766e]/30 text-[#0f766e]",
                  )}
                >
                  Back to Quizzes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const title = bankMatches.document_name?.trim() || "Question Bank";

  return (
    <div
      className={cn(
        "relative space-y-6 font-[family-name:var(--font-study-sans)]",
        display.variable,
        sans.variable,
      )}
    >
      <div
        className="pointer-events-none absolute -inset-x-4 -top-6 h-56 rounded-[2rem] opacity-90 sm:-inset-x-6"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 15% 0%, rgba(45,212,191,0.18), transparent 55%), radial-gradient(ellipse 60% 50% at 90% 20%, rgba(240,196,25,0.1), transparent 50%)",
        }}
        aria-hidden
      />

      <div className="relative space-y-6">
        <PageHeader
          title={title}
          description={
            questionCount > 0
              ? "Review questions, then take the shuffled quiz"
              : "No questions in this bank yet"
          }
          showBack
          backHref={routes.questionBank}
          className="[&_h1]:font-[family-name:var(--font-study-display)] [&_h1]:tracking-tight [&_h1]:text-[#0c2420]"
          actions={
            questionCount > 0 ? (
              <Link
                href={routes.questionBankQuiz(params.documentId)}
                className="w-full sm:w-auto"
              >
                <Button className="w-full rounded-full bg-[#0f766e] hover:bg-[#0d9488] sm:w-auto">
                  Take quiz
                </Button>
              </Link>
            ) : undefined
          }
        />

        <QuestionPreviewList questions={questions} />
      </div>
    </div>
  );
}
