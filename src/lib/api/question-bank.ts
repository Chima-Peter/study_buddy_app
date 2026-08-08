import { api } from "./client";
import type {
  CursorPage,
  QuestionBank,
  QuestionBankQuestion,
  QuestionBankStatus,
} from "@/types";
import { DEFAULT_PAGE_LIMIT } from "@/config/constants";

/** Accept flat list or legacy `{ chapters: [{ questions }] }` payloads. */
export function normalizeQuestionBankResult(
  result: QuestionBank["result"] | unknown,
): QuestionBankQuestion[] {
  if (!result) return [];
  if (Array.isArray(result)) return result as QuestionBankQuestion[];
  if (
    typeof result === "object" &&
    "chapters" in result &&
    Array.isArray((result as { chapters: unknown }).chapters)
  ) {
    return (
      result as { chapters: { questions?: QuestionBankQuestion[] }[] }
    ).chapters.flatMap((c) => (Array.isArray(c.questions) ? c.questions : []));
  }
  return [];
}

function normalizeBank(bank: QuestionBank): QuestionBank {
  return {
    ...bank,
    result: normalizeQuestionBankResult(bank.result),
  };
}

export function listQuestionBanks(params: {
  cursor?: string | null;
  status?: QuestionBankStatus;
  limit?: number;
} = {}) {
  const qs = new URLSearchParams({
    limit: String(params.limit ?? DEFAULT_PAGE_LIMIT),
  });
  if (params.cursor) qs.set("cursor", params.cursor);
  if (params.status) qs.set("status", params.status);
  return api.get<CursorPage<QuestionBank>>(`/question-bank?${qs}`);
}

export function generateQuestionBank(documentId: string) {
  return api.post<{ document_id: string }>(`/question-bank/${documentId}`);
}

export function retryQuestionBank(documentId: string) {
  return api.post<{ document_id: string }>(`/question-bank/${documentId}/retry`);
}

export async function getQuestionBank(documentId: string) {
  const bank = await api.get<QuestionBank>(`/question-bank/${documentId}`);
  return normalizeBank(bank);
}
