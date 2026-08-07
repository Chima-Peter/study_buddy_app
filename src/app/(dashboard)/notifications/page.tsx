"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import {
  listNotifications,
  markNotificationsRead,
} from "@/lib/api/notifications";
import { useNotificationsStore } from "@/stores/notifications-store";
import { NotificationList } from "@/components/notifications/notification-list";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

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
  const { items, hasMore, nextCursor, unreadCount, setPage, queueRead, markRead } =
    useNotificationsStore();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
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

  const visibleItems =
    filter === "unread" ? items.filter((notification) => !notification.read_at) : items;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Inbox"
        description={
          unreadCount > 0
            ? `${unreadCount} unread ${unreadCount === 1 ? "notification" : "notifications"}`
            : "You're all caught up"
        }
        actions={
          unreadCount > 0 ? (
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={onMarkAll}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          ) : null
        }
      />

      <div className="flex items-center justify-between border-b border-border">
        <div className="flex gap-1" role="tablist" aria-label="Notification filters">
          {(["all", "unread"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={filter === value}
              className={cn(
                "relative min-h-11 px-4 text-sm font-medium capitalize text-[var(--text-secondary)] transition-colors",
                "hover:text-[var(--text-primary)]",
                filter === value && "text-primary-700",
              )}
              onClick={() => setFilter(value)}
            >
              {value}
              {value === "unread" && unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-primary-500/15 px-1.5 py-0.5 text-[11px] text-primary-700">
                  {unreadCount}
                </span>
              )}
              {filter === value && (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary-700" />
              )}
            </button>
          ))}
        </div>
        <Bell className="mr-2 h-4 w-4 text-muted" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <NotificationList
          items={visibleItems}
          onSelect={onSelect}
          emptyMessage={
            filter === "unread" ? "No unread notifications" : "You're all caught up"
          }
        />
      )}
      {hasMore && (
        <div className="flex justify-center">
          <Button variant="ghost" onClick={loadMore} disabled={loadingMore}>
            {loadingMore && <Spinner className="h-3.5 w-3.5" />}
            {loadingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
