"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  listNotifications,
  markNotificationsRead,
} from "@/lib/api/notifications";
import { useNotificationsStore } from "@/stores/notifications-store";
import { NotificationList } from "@/components/notifications/notification-list";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { routes } from "@/config/routes";

async function flushPendingReads() {
  const ids = useNotificationsStore.getState().consumePendingReads();
  if (ids.length === 0) return;
  try {
    await markNotificationsRead(ids);
  } catch {
    // Keep optimistic UI; unread badge may refresh on next fetch
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const { items, hasMore, nextCursor, setPage, queueRead, markRead } =
    useNotificationsStore();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await listNotifications();
        if (!cancelled) setPage(data.items, data.next_cursor, data.has_more);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      void flushPendingReads();
    };
  }, [setPage]);

  const onSelect = (id: string) => {
    queueRead(id);
  };

  const onMarkAll = async () => {
    const ids = items.filter((n) => !n.read_at).map((n) => n.id);
    if (ids.length === 0) return;
    try {
      await markNotificationsRead(ids);
      markRead(ids);
      toast({ title: "All marked as read", variant: "success" });
    } catch (err) {
      toast({
        title: "Could not mark all",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    }
  };

  const onClose = async () => {
    await flushPendingReads();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(routes.library);
    }
  };

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const data = await listNotifications({ cursor: nextCursor });
      setPage(data.items, data.next_cursor, data.has_more, true);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated on documents, study cards, and other alerts"
        backHref={routes.library}
        onClose={onClose}
        actions={
          <Button variant="secondary" onClick={onMarkAll}>
            Mark all as read
          </Button>
        }
      />
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <NotificationList items={items} onSelect={onSelect} />
      )}
      {hasMore && (
        <div className="flex justify-center">
          <Button variant="ghost" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
