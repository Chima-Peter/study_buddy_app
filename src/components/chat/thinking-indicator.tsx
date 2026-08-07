"use client";

import { cn } from "@/lib/utils/cn";

export function ThinkingIndicator({
  label = "Thinking",
  className,
  compact = false,
}: {
  label?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn("inline-flex items-center gap-2", className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className="thinking-spark" aria-hidden>
        <svg
          viewBox="0 0 16 16"
          className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5")}
          fill="currentColor"
        >
          <path d="M8 0.6c.35 2.4 1.15 4.2 2.7 5.7 1.55 1.5 3.35 2.25 5.7 2.5-2.35.25-4.15 1-5.7 2.5C9.15 12.8 8.35 14.6 8 15.4c-.35-2.4-1.15-4.2-2.7-5.7C3.75 8.2 1.95 7.45-.4 7.2c2.35-.25 4.15-1 5.7-2.5C6.85 3.2 7.65 1.4 8 .6Z" />
        </svg>
      </span>
      <span
        className={cn(
          "text-[var(--text-secondary)]",
          compact ? "text-xs" : "text-sm",
        )}
      >
        {label}
      </span>
    </div>
  );
}
