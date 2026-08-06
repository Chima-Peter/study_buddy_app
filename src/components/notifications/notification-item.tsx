"use client";

import type { Notification } from "@/types";
import { formatRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function NotificationItem({
  notification,
  onSelect,
}: {
  notification: Notification;
  onSelect: (id: string) => void;
}) {
  const unread = !notification.read_at;

  return (
    <button
      type="button"
      className={cn(
        "w-full rounded-lg border p-4 text-left transition-colors",
        unread
          ? "border-primary-500/30 bg-primary-500/5 hover:border-primary-500/50"
          : "border-border bg-surface-secondary hover:border-border-strong",
      )}
      onClick={() => {
        if (unread) onSelect(notification.id);
      }}
    >
      <div className="flex items-center gap-2">
        {unread && (
          <span className="h-2 w-2 shrink-0 rounded-full bg-primary-500" aria-hidden />
        )}
        <h3 className="font-medium">{notification.title}</h3>
      </div>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{notification.content}</p>
      <p className="mt-2 text-xs text-muted">{formatRelative(notification.created_at)}</p>
    </button>
  );
}
