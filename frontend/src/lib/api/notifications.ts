import { api } from "./client";
import type { CursorPage, Notification } from "@/types";
import { DEFAULT_PAGE_LIMIT } from "@/config/constants";

export function listNotifications(params: {
  cursor?: string | null;
  unread_only?: boolean;
  limit?: number;
} = {}) {
  const qs = new URLSearchParams({
    limit: String(params.limit ?? DEFAULT_PAGE_LIMIT),
  });
  if (params.cursor) qs.set("cursor", params.cursor);
  if (params.unread_only) qs.set("unread_only", "true");
  return api.get<CursorPage<Notification>>(`/notifications?${qs}`);
}

export function markNotificationRead(id: string) {
  return api.patch<Notification>(`/notifications/${id}/read`);
}

export function markNotificationsRead(ids: string[]) {
  return api.patch<{ ids: string[] }>("/notifications/read", { ids });
}
