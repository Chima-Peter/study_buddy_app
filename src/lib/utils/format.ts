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
