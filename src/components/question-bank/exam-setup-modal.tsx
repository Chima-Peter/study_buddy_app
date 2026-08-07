"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const COUNT_PRESETS = [5, 10, 15, 20] as const;
const TIMER_PRESETS = [5, 10, 15, 20, 30] as const;

export type ExamStartOptions = {
  count: number;
  /** Minutes; `null` = no timer. */
  timerMinutes: number | null;
};

function Stepper({
  id,
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  id: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Decrease"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface-secondary text-[var(--text-primary)] disabled:opacity-40"
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-surface-secondary px-3">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isFinite(n)) return;
            onChange(Math.min(max, Math.max(min, Math.floor(n))));
          }}
          className="w-14 bg-transparent text-center text-base font-semibold tabular-nums outline-none"
        />
        {suffix && (
          <span className="text-sm text-[var(--text-secondary)]">{suffix}</span>
        )}
      </div>
      <button
        type="button"
        aria-label="Increase"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface-secondary text-[var(--text-primary)] disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ExamSetupModal({
  open,
  onOpenChange,
  total,
  onStart,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onStart: (options: ExamStartOptions) => void;
}) {
  const maxCount = Math.max(1, total);
  const [count, setCount] = useState(Math.min(10, maxCount));
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(15);

  useEffect(() => {
    if (!open) return;
    setCount(Math.min(10, maxCount));
    setTimerEnabled(false);
    setTimerMinutes(15);
  }, [open, maxCount]);

  const countPresets = COUNT_PRESETS.filter((n) => n <= maxCount);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Start exam"
      description={`Choose how many of the ${total} questions to include.`}
    >
      <div className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <label
              htmlFor="exam-count"
              className="text-sm font-medium text-[var(--text-primary)]"
            >
              Questions
            </label>
            <span className="text-xs text-[var(--text-secondary)]">
              max {maxCount}
            </span>
          </div>
          <Stepper
            id="exam-count"
            value={count}
            min={1}
            max={maxCount}
            onChange={setCount}
          />
          {countPresets.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {countPresets.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  className={cn(
                    "min-h-11 rounded-full border text-sm font-medium transition-colors",
                    count === n
                      ? "border-[#0f766e] bg-[#0f766e]/10 text-[#0f766e]"
                      : "border-border text-[var(--text-secondary)] active:bg-surface-tertiary",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <button
            id="exam-timer-toggle"
            type="button"
            role="switch"
            aria-checked={timerEnabled}
            onClick={() => setTimerEnabled((v) => !v)}
            className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface-secondary px-4"
          >
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Timer
            </span>
            <span
              className={cn(
                "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                timerEnabled ? "bg-[#0f766e]" : "bg-surface-tertiary",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                  timerEnabled && "translate-x-5",
                )}
              />
            </span>
          </button>

          {timerEnabled ? (
            <div className="space-y-3">
              <Stepper
                id="exam-timer"
                value={timerMinutes}
                min={1}
                max={180}
                onChange={setTimerMinutes}
                suffix="min"
              />
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {TIMER_PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setTimerMinutes(n)}
                    className={cn(
                      "min-h-11 rounded-full border text-sm font-medium transition-colors",
                      timerMinutes === n
                        ? "border-[#0f766e] bg-[#0f766e]/10 text-[#0f766e]"
                        : "border-border text-[var(--text-secondary)] active:bg-surface-tertiary",
                    )}
                  >
                    {n}m
                  </button>
                ))}
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                Auto-submits when time runs out.
              </p>
            </div>
          ) : (
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              Optional. Turn on to limit how long the exam lasts.
            </p>
          )}
        </section>

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            className="w-full rounded-full bg-[#0f766e] hover:bg-[#0d9488] sm:w-auto"
            disabled={
              count < 1 ||
              count > maxCount ||
              (timerEnabled && timerMinutes < 1)
            }
            onClick={() =>
              onStart({
                count,
                timerMinutes: timerEnabled ? timerMinutes : null,
              })
            }
          >
            Begin exam
          </Button>
        </div>
      </div>
    </Modal>
  );
}
