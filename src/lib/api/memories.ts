import { api } from "./client";
import type { CursorPage, Memory } from "@/types";
import { DEFAULT_PAGE_LIMIT } from "@/config/constants";

export function listMemories(params: {
  cursor?: string | null;
  limit?: number;
} = {}) {
  const qs = new URLSearchParams({
    limit: String(params.limit ?? DEFAULT_PAGE_LIMIT),
  });
  if (params.cursor) qs.set("cursor", params.cursor);
  return api.get<CursorPage<Memory>>(`/memories?${qs}`);
}
