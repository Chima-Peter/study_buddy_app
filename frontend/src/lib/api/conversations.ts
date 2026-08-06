import { api } from "./client";
import type { ConversationDetail, ConversationListItem, CursorPage } from "@/types";
import { DEFAULT_PAGE_LIMIT } from "@/config/constants";

export function listConversations(cursor?: string | null, limit = DEFAULT_PAGE_LIMIT) {
  const qs = new URLSearchParams({ limit: String(limit) });
  if (cursor) qs.set("cursor", cursor);
  return api.get<CursorPage<ConversationListItem>>(`/conversations?${qs}`);
}

export function getConversation(id: string) {
  return api.get<ConversationDetail>(`/conversations/${id}`);
}

export function renameConversation(id: string, title: string) {
  return api.patch<ConversationListItem>(`/conversations/${id}`, { title });
}
