"use client";

import type { Notification } from "@/types";
import { NotificationItem } from "./notification-item";

export function NotificationList({
  items,
  onSelect,
}: {
  items: Notification[];
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <p className="font-medium">You&apos;re all caught up</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Alerts about documents, study cards, and other activity will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((n) => (
        <NotificationItem key={n.id} notification={n} onSelect={onSelect} />
      ))}
    </div>
  );
}
