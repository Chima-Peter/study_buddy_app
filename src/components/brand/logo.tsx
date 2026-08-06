import { useId } from "react";
import { cn } from "@/lib/utils/cn";

type LogoMarkProps = {
  className?: string;
  title?: string;
};

/** Open book + companion spark — StudyBuddy mark */
export function LogoMark({ className, title }: LogoMarkProps) {
  const gradId = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 overflow-hidden", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={gradId} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14b8a6" />
          <stop offset="0.55" stopColor="#0d9488" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${gradId})`} />
      {/* Left page */}
      <path
        d="M7 11.2c2.8-1.4 5.4-.6 7.2 1.2v10.4c-2-1.6-4.6-2.4-7.2-1.1V11.2Z"
        fill="#f0fdfa"
        fillOpacity="0.95"
      />
      {/* Right page */}
      <path
        d="M25 11.2c-2.8-1.4-5.4-.6-7.2 1.2v10.4c2-1.6 4.6-2.4 7.2-1.1V11.2Z"
        fill="#ccfbf1"
        fillOpacity="0.92"
      />
      {/* Spine highlight */}
      <path d="M16 12.4v10.2" stroke="#0f766e" strokeOpacity="0.35" strokeWidth="1.2" strokeLinecap="round" />
      {/* Buddy spark */}
      <circle cx="23.2" cy="9.2" r="3.4" fill="#fef9c3" />
      <circle cx="23.2" cy="9.2" r="1.55" fill="#0f766e" />
    </svg>
  );
}

type LogoProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
  accentClassName?: string;
};

export function Logo({
  className,
  markClassName,
  wordmarkClassName,
  showWordmark = true,
  accentClassName = "text-primary-700",
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={cn("h-8 w-8", markClassName)} />
      {showWordmark ? (
        <span className={cn("text-lg font-semibold tracking-tight", wordmarkClassName)}>
          Study<span className={accentClassName}>Buddy</span>
        </span>
      ) : null}
    </span>
  );
}
