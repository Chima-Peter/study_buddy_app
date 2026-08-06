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
