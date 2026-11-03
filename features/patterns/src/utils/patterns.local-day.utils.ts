/**
 * Calendar-day helpers in the viewer's local timezone. Every "Today" /
 * "Yesterday" / "Nd ago" label must come from these so a group header and the
 * rows inside it can never disagree (#325).
 */

const DAY_MS = 86_400_000;

function toDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}

/** Stable key for the local calendar day of `value` (or the UTC day). */
export function localDayKey(value: Date | string | number, utc = false) {
  const d = toDate(value);
  return utc
    ? `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
    : `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * Whole local calendar days from `value` to `now`: 0 = same day, 1 =
 * yesterday. Rounded so DST transitions (23h / 25h days) don't skew it.
 */
export function localDaysAgo(
  value: Date | string | number,
  now: Date | number = Date.now(),
) {
  const d = toDate(value);
  const n = toDate(now);
  return Math.round((startOfLocalDay(n) - startOfLocalDay(d)) / DAY_MS);
}

/** "Today", "Yesterday", else a weekday date (year when not current). */
export function localDayLabel(
  value: Date | string | number,
  now: Date | number = Date.now(),
  weekday: "short" | "long" = "short",
) {
  const d = toDate(value);
  const days = localDaysAgo(d, now);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday,
    month: "short",
    day: "numeric",
    ...(d.getFullYear() !== toDate(now).getFullYear()
      ? { year: "numeric" as const }
      : {}),
  });
}
