"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { listTimezones } from "@/lib/utils/timezones";

const TIMEZONES = listTimezones();

function formatTimezone(tz: string) {
  return tz.replaceAll("_", " ");
}

export function TimezoneSelect({
  value,
  onChange,
  label = "Timezone",
  error,
}: {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const base =
      value && !TIMEZONES.includes(value) ? [value, ...TIMEZONES] : TIMEZONES;
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((tz) => formatTimezone(tz).toLowerCase().includes(q));
  }, [query, value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full space-y-1.5 sm:col-span-2 sm:max-w-md">
      <label
        htmlFor={id}
        className={cn(
          "block text-sm font-medium",
          error ? "text-error" : "text-[var(--text-secondary)]",
        )}
      >
        {label}
      </label>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((prev) => !prev);
          setQuery("");
        }}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-md border bg-surface-tertiary px-3 text-left text-sm transition-colors",
          "focus-visible:border-primary-500 focus-visible:ring-1 focus-visible:ring-primary-500",
          error ? "border-error" : "border-border",
          value ? "text-[var(--text-primary)]" : "text-muted",
        )}
      >
        <span className="truncate">
          {value ? formatTimezone(value) : "Select a timezone"}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-surface-elevated shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search timezones…"
              className="h-8 w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-muted"
            />
          </div>
          <ul
            role="listbox"
            className="max-h-56 overflow-y-auto py-1"
          >
            {options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">No matches</li>
            ) : (
              options.map((tz) => {
                const selected = tz === value;
                return (
                  <li key={tz}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        onChange(tz);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                        selected
                          ? "bg-primary-500/10 text-brand"
                          : "text-[var(--text-primary)] hover:bg-surface-tertiary",
                      )}
                    >
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          selected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="truncate">{formatTimezone(tz)}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
