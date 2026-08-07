"use client";

import {
  Check,
  CheckCircle2,
  CircleAlert,
  CircleX,
  Info,
} from "lucide-react";
import type { Notification } from "@/types";
import { formatRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

function getNotificationStyle(notification: Notification) {
  const normalized = `${notification.title} ${notification.content}`.toLowerCase();
  const isQuestionBank = normalized.includes("question bank");
  const isStudyCards = !isQuestionBank && normalized.includes("study card");

  if (normalized.includes("failed") || normalized.includes("error")) {
    return {
      title: isQuestionBank
        ? "Question bank failed"
        : isStudyCards
          ? "Study cards failed"
          : "Ingestion failed",
      icon: CircleAlert,
      iconClass: "bg-error/10 text-error",
    };
  }
  if (normalized.includes("cancel")) {
    return {
      title: "Processing cancelled",
      icon: CircleX,
      iconClass: "bg-warning/10 text-warning",
    };
  }
  if (
    normalized.includes("successfully") ||
    normalized.includes("ready to use")
  ) {
    return {
      title: isQuestionBank
        ? "Question bank ready"
        : isStudyCards
          ? "Study cards ready"
          : "Document ready",
      icon: CheckCircle2,
      iconClass: "bg-success/10 text-success",
    };
  }
  return {
    title: notification.title,
    icon: Info,
    iconClass: "bg-primary-500/10 text-primary-700",
  };
}

export function NotificationItem({
  notification,
  onSelect,
}: {
  notification: Notification;
  onSelect: (id: string) => void;
}) {
  const unread = !notification.read_at;
  const style = getNotificationStyle(notification);
  const Icon = style.icon;

  return (
    <button
      type="button"
      className={cn(
        "group flex w-full items-start gap-3 border-b border-border px-4 py-4 text-left transition-colors last:border-b-0",
        unread
          ? "bg-primary-500/[0.04] hover:bg-primary-500/[0.08]"
          : "bg-surface-secondary hover:bg-surface-tertiary/60",
      )}
      onClick={() => {
        if (unread) onSelect(notification.id);
      }}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          style.iconClass,
        )}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className={cn("text-sm", unread ? "font-semibold" : "font-medium")}>
            {style.title}
          </span>
          {unread && (
            <span className="rounded-full bg-primary-500/15 px-2 py-0.5 text-[11px] font-medium text-primary-700">
              New
            </span>
          )}
        </span>
        <span className="mt-1 block text-sm leading-5 text-[var(--text-secondary)]">
          {notification.content}
        </span>
        <span className="mt-2 block text-xs text-muted">
          {formatRelative(notification.created_at)}
        </span>
      </span>

      {unread && (
        <span
          className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          title="Mark as read"
        >
          <Check className="h-4 w-4" />
        </span>
      )}
    </button>
  );
}
