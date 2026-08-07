"use client";

import { BellOff } from "lucide-react";
import type { Notification } from "@/types";
import { NotificationItem } from "./notification-item";

export function NotificationList({
  items,
  onSelect,
  emptyMessage = "You're all caught up",
}: {
  items: Notification[];
  onSelect: (id: string) => void;
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface-tertiary text-muted">
          <BellOff className="h-5 w-5" />
        </span>
        <p className="mt-3 font-medium">{emptyMessage}</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Alerts about documents, study cards, and other activity will appear here
        </p>
      </div>
    );
  }

  const unread = items.filter((notification) => !notification.read_at);
  const earlier = items.filter((notification) => notification.read_at);

  return (
    <div className="space-y-6">
      {unread.length > 0 && (
        <section>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
            New
          </h2>
          <div className="overflow-hidden rounded-xl border border-border bg-surface-secondary">
            {unread.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      )}

      {earlier.length > 0 && (
        <section>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Earlier
          </h2>
          <div className="overflow-hidden rounded-xl border border-border bg-surface-secondary">
            {earlier.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
