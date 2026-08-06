"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function PageHeader({
  title,
  description,
  backHref,
  showBack = false,
  onClose,
  actions,
  className,
}: {
  title: string;
  description?: string;
  /** Fallback when browser history cannot go back */
  backHref?: string;
  /** Show back control (use on nested/detail pages only) */
  showBack?: boolean;
  onClose?: () => void;
  actions?: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    if (backHref) router.push(backHref);
  };

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2">
        {showBack && (
          <button
            type="button"
            onClick={goBack}
            className="flex min-touch shrink-0 items-center justify-center rounded-md p-2 text-[var(--text-secondary)] hover:bg-surface-tertiary hover:text-[var(--text-primary)]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
          {description && (
            <p className="text-sm text-[var(--text-secondary)]">{description}</p>
          )}
        </div>
      </div>
      {(actions || onClose) && (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {actions}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex min-touch items-center justify-center rounded-md border border-border p-2 text-[var(--text-secondary)] hover:bg-surface-tertiary hover:text-[var(--text-primary)]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
