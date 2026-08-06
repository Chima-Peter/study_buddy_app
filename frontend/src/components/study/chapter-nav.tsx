"use client";

import { cn } from "@/lib/utils/cn";
import type { StudyChapter } from "@/types";

export function ChapterNav({
  chapters,
  activeKey,
  onSelect,
}: {
  chapters: StudyChapter[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <nav className="space-y-1" aria-label="Chapters">
      {chapters.map((ch, idx) => (
        <button
          key={ch.chapter_key}
          type="button"
          onClick={() => onSelect(ch.chapter_key)}
          className={cn(
            "flex w-full min-touch rounded-md px-3 py-2 text-left text-sm transition-colors",
            activeKey === ch.chapter_key
              ? "bg-primary-500/15 text-primary-400"
              : "text-[var(--text-secondary)] hover:bg-surface-tertiary",
          )}
        >
          Ch {idx + 1}: {ch.chapter_key}
        </button>
      ))}
    </nav>
  );
}
