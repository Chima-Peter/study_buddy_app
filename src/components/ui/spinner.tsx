import { cn } from "@/lib/utils/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent",
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="relative h-16 w-16"
      role="status"
      aria-label={label}
    >
      <div className="absolute inset-0 rounded-full border-2 border-primary-500/15" />
      <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-r-[#f0c419] border-t-[#0f766e]" />
      <div className="absolute inset-3 animate-pulse rounded-full bg-[#14b8a6]/10" />
      <div className="absolute inset-[1.35rem] rounded-full bg-[#0f766e]" />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse-soft rounded-md bg-surface-tertiary", className)} />
  );
}
