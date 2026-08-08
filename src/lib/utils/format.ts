import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatDate(value: string) {
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch {
    return value;
  }
}

export function formatRelative(value: string) {
  try {
    return formatDistanceToNow(parseISO(value), { addSuffix: true });
  } catch {
    return value;
  }
}

export function formatPercent(correct: number, total: number) {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

const NO_CHAPTERS_MESSAGE =
  "This document has no chapters. Check the document and try again.";

/** Map ingest failure comments/codes to user-facing copy. */
export function formatIngestFailureMessage(comment?: string | null) {
  const trimmed = comment?.trim();
  if (!trimmed) return null;

  const normalized = trimmed.toLowerCase().replace(/[_-]+/g, " ");
  if (
    normalized.includes("no chapters") ||
    normalized.includes("no chapter") ||
    normalized === "nochapters"
  ) {
    return NO_CHAPTERS_MESSAGE;
  }

  return trimmed;
}

/** Turn keys like `chapter_1` into `Chapter 1`. */
export function formatChapterTitle(key: string) {
  const trimmed = key.trim();
  if (!trimmed) return key;

  const numbered = trimmed.match(/^chapter[_-\s]*(\d+)$/i);
  if (numbered) return `Chapter ${numbered[1]}`;

  return trimmed
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
