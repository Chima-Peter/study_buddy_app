"use client";

import Link from "next/link";
import type { Notification } from "@/types";
import { formatRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/config/routes";

function inferLink(notification: Notification): string | null {
  const text = `${notification.title} ${notification.content}`.toLowerCase();
  if (text.includes("study")) return routes.study;
  if (text.includes("document") || text.includes("ready") || text.includes("failed")) {
    return routes.library;
  }
  return null;
}

export function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: string) => void;
}) {
  const unread = !notification.read_at;
  const href = inferLink(notification);

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-colors",
        unread
          ? "border-primary-500/30 bg-primary-500/5"
          : "border-border bg-surface-secondary",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {unread && (
              <span className="h-2 w-2 rounded-full bg-primary-500" aria-hidden />
            )}
            <h3 className="font-medium">{notification.title}</h3>
          </div>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{notification.content}</p>
          <p className="mt-2 text-xs text-muted">{formatRelative(notification.created_at)}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {unread && (
            <button
              type="button"
              className="text-xs text-primary-400 hover:underline min-touch px-2"
              onClick={() => onRead(notification.id)}
            >
              Mark read
            </button>
          )}
          {href && (
            <Link href={href} className="text-xs text-primary-400 hover:underline min-touch px-2">
              View →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
