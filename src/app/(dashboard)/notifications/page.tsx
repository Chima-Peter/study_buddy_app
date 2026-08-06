"use client";

import { useEffect, useState } from "react";
import {
  listNotifications,
  markNotificationRead,
  markNotificationsRead,
} from "@/lib/api/notifications";
import { useNotificationsStore } from "@/stores/notifications-store";
import { NotificationList } from "@/components/notifications/notification-list";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";

export default function NotificationsPage() {
  const { items, hasMore, nextCursor, setPage, markRead } = useNotificationsStore();
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
    };
  }, [setPage]);

  const onRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      markRead([id]);
    } catch (err) {
      toast({
        title: "Could not mark as read",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    }
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Stay updated on document processing and study cards
          </p>
        </div>
        <Button variant="secondary" onClick={onMarkAll}>
          Mark all as read
        </Button>
      </div>
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <NotificationList items={items} onRead={onRead} />
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
