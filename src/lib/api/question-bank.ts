import { api } from "./client";
import type { CursorPage, QuestionBank, QuestionBankStatus } from "@/types";
import { DEFAULT_PAGE_LIMIT } from "@/config/constants";

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

export function getQuestionBank(documentId: string) {
  return api.get<QuestionBank>(`/question-bank/${documentId}`);
}
