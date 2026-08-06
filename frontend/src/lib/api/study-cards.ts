import { api } from "./client";
import type { CursorPage, StudyCards, StudyCardsStatus } from "@/types";
import { DEFAULT_PAGE_LIMIT } from "@/config/constants";

export function listStudyCards(params: {
  cursor?: string | null;
  status?: StudyCardsStatus;
  limit?: number;
} = {}) {
  const qs = new URLSearchParams({
    limit: String(params.limit ?? DEFAULT_PAGE_LIMIT),
  });
  if (params.cursor) qs.set("cursor", params.cursor);
  if (params.status) qs.set("status", params.status);
  return api.get<CursorPage<StudyCards>>(`/study-cards?${qs}`);
}

export function generateStudyCards(documentId: string) {
  return api.post<{ document_id: string }>(`/study-cards/${documentId}`);
}

export function getStudyCards(documentId: string) {
  return api.get<StudyCards>(`/study-cards/${documentId}`);
}
