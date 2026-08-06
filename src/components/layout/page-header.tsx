"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function PageHeader({
  title,
  description,
  backHref,
  onClose,
  actions,
  className,
}: {
  title: string;
  description?: string;
  /** Fallback when browser history cannot go back */
  backHref?: string;
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
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="flex min-w-0 items-start gap-2">
        <button
          type="button"
          onClick={goBack}
          className="mt-0.5 flex min-touch shrink-0 items-center justify-center rounded-md p-2 text-[var(--text-secondary)] hover:bg-surface-tertiary hover:text-[var(--text-primary)]"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && (
            <p className="text-sm text-[var(--text-secondary)]">{description}</p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
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
    </div>
  );
}
