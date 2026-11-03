import { localDaysAgo } from "@features/patterns/utils/patterns.local-day.utils";
import { formatDate } from "@/lib/format";

/**
 * Compact relative time for stat cards and list rows (avoids wrapping e.g.
 * "8 months ago"). Counted in local calendar days, the same computation as
 * the notifications "Today" / "Yesterday" groups (#325): something from last
 * night is "1d ago", never "Today".
 */
export function formatRelativeShort(
  value: Date | string | number,
  now: Date | number = Date.now(),
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const days = Math.max(0, localDaysAgo(date, now));

  if (days < 1) return "Today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 30) {
    const weeks = Math.max(1, Math.floor(days / 7));
    return `${weeks}w ago`;
  }
  if (days < 365) {
    const months = Math.max(1, Math.floor(days / 30));
    return `${months}mo ago`;
  }

  return formatDate(date, { month: "short", year: "numeric" });
}
