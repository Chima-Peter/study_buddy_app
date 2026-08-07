"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { QuestionBank } from "@/types";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import {
  generateQuestionBank,
  getQuestionBank,
} from "@/lib/api/question-bank";
import { useQuestionBankStore } from "@/stores/question-bank-store";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

function statusLabel(status: QuestionBank["status"]) {
  if (status === "success") return "Ready";
  if (status === "failed") return "Failed";
  return "Generating";
}

export function BankCard({ bank }: { bank: QuestionBank }) {
  const router = useRouter();
  const { toast } = useToast();
  const setCurrent = useQuestionBankStore((s) => s.setCurrent);
  const upsert = useQuestionBankStore((s) => s.upsert);
  const [opening, setOpening] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const title =
    bank.document_name?.trim() || `Document ${bank.document_id.slice(0, 8)}…`;

  const openBank = async () => {
    setOpening(true);
    try {
      const full = await getQuestionBank(bank.document_id);
      setCurrent(full);
      upsert(full);
      router.push(routes.questionBankDetail(bank.document_id));
    } catch (err) {
      setOpening(false);
      toast({
        title: "Could not open quiz",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    }
  };

  const retry = async () => {
    setRetrying(true);
    try {
      await generateQuestionBank(bank.document_id);
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

  return (
    <article className="study-flashcard relative overflow-hidden">
      <div
        className="pointer-events-none absolute right-0 top-0 h-14 w-14"
        style={{
          background:
            "linear-gradient(225deg, rgba(240,196,25,0.55) 0%, rgba(240,196,25,0.08) 45%, transparent 55%)",
        }}
        aria-hidden
      />

      <div className="flex items-center justify-between gap-3 border-b border-[#0c2420]/08 px-5 pb-3 pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0f766e]">
          Question bank
        </p>
        <span
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.12em]",
            bank.status === "success" && "text-[#0f766e]",
            bank.status === "failed" && "text-[#b91c1c]",
            bank.status === "pending" && "text-[#b45309]",
          )}
        >
          {statusLabel(bank.status)}
        </span>
      </div>

      <div className="relative px-5 pb-2 pt-5">
        <div
          className="absolute left-0 top-5 bottom-2 w-1 rounded-r-full bg-[#14b8a6]"
          aria-hidden
        />
        <h3 className="line-clamp-2 pl-3 font-[family-name:var(--font-study-display)] text-xl font-semibold leading-tight tracking-tight text-[#0c2420]">
          {title}
        </h3>

        {bank.status === "success" && (
          <p className="mt-2 pl-3 font-[family-name:var(--font-study-sans)] text-sm text-[#5a7a73]">
            {bank.question_count ?? 0} questions
          </p>
        )}
        {bank.status === "pending" && (
          <p className="mt-2 pl-3 font-[family-name:var(--font-study-sans)] text-sm text-[#5a7a73]">
            Generating question bank…
          </p>
        )}
        {bank.status === "failed" && (
          <p className="mt-2 pl-3 font-[family-name:var(--font-study-sans)] text-sm text-[#5a7a73]">
            Generation failed — you can retry
          </p>
        )}
      </div>

      <div className="px-5 pb-5 pt-4">
        {bank.status === "success" && (
          <Button
            size="sm"
            onClick={openBank}
            disabled={opening}
            className="w-full rounded-full bg-[#0f766e] hover:bg-[#0d9488]"
          >
            {opening && (
              <Spinner className="h-3.5 w-3.5 border-white/40 border-t-white" />
            )}
            {opening ? "Opening…" : "Open"}
          </Button>
        )}
        {bank.status === "failed" && (
          <Button
            size="sm"
            variant="secondary"
            onClick={retry}
            disabled={retrying}
            className="w-full rounded-full border-[#0f766e]/30 text-[#0f766e]"
          >
            {retrying && (
              <Spinner className="h-3.5 w-3.5 border-[#0f766e]/40 border-t-[#0f766e]" />
            )}
            {retrying ? "Queuing…" : "Retry"}
          </Button>
        )}
      </div>
    </article>
  );
}
