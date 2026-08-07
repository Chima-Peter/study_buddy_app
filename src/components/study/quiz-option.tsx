"use client";

import { cn } from "@/lib/utils/cn";

export function QuizOption({
  label,
  index,
  selected,
  revealed,
  correct,
  onSelect,
}: {
  label: string;
  index: number;
  selected: boolean;
  revealed: boolean;
  correct: boolean;
  onSelect: () => void;
}) {
  const letter = String.fromCharCode(65 + index);
  let styles = "border-border bg-surface-tertiary";
  if (revealed && correct) styles = "border-success bg-success/15 text-success-dark";
  else if (revealed && selected && !correct) styles = "border-error bg-error/15 text-error-dark";
  else if (selected) styles = "border-primary-500 bg-primary-500/15";

  return (
    <button
      type="button"
      disabled={revealed}
      onClick={onSelect}
      className={cn(
        "flex w-full min-h-11 items-start gap-3 rounded-2xl border px-4 py-3.5 text-left text-[15px] leading-snug transition-colors sm:min-touch sm:rounded-lg sm:py-3 sm:text-sm sm:leading-normal",
        styles,
      )}
    >
      <span className="font-semibold">{letter}.</span>
      <span className="flex-1">{label}</span>
      {revealed && correct && <span>✓</span>}
    </button>
  );
}
