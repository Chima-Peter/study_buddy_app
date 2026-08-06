"use client";

import { cn } from "@/lib/utils/cn";
import { useNotificationsStore } from "@/stores/notifications-store";

export function UnreadBadge({ compact }: { compact?: boolean }) {
  const count = useNotificationsStore((s) => s.unreadCount);
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-error font-semibold text-white",
        compact ? "h-4 min-w-4 px-1 text-[10px]" : "h-5 min-w-5 px-1.5 text-[11px]",
      )}
      aria-label={`${count} unread notifications`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
