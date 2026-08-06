import { cn } from "@/lib/utils/cn";

const variants = {
  default: "bg-surface-tertiary text-[var(--text-secondary)]",
  primary: "bg-primary-500/15 text-primary-400",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  error: "bg-error/15 text-error",
  outline: "border border-border text-[var(--text-secondary)]",
} as const;

export function Badge({
  variant = "default",
  className,
  children,
}: {
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
