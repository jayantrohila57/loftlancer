"use client";

import { useHydrated } from "../hooks/use-hydrated";
import {
  formatDate,
  LOCAL_DATE_FORMAT,
  LOCAL_DATE_TIME_FORMAT,
} from "../lib/format-date";
import { cn } from "../lib/utils";

export { LOCAL_DATE_FORMAT, LOCAL_DATE_TIME_FORMAT };

function toDate(value: Date | string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * An absolute date/time in the viewer's timezone with no hydration flicker
 * (#327). The server has no idea of the viewer's zone, so the server HTML and
 * the hydration pass render the same UTC text *invisibly* (reserving the
 * width); right after hydration the local value is painted in the same box.
 * Client-side navigations render the local value immediately.
 */
export function LocalDateTime({
  value,
  options = LOCAL_DATE_FORMAT,
  className,
  fallback = "—",
  showTimeOnHover = false,
}: {
  value: Date | string | number | null | undefined;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
  fallback?: string;
  /** Keep dense list cells date-only while exposing the exact local time on hover. */
  showTimeOnHover?: boolean;
}) {
  const hydrated = useHydrated();
  const date = toDate(value);
  if (!date) return <span className={className}>{fallback}</span>;
  const text = formatDate(
    date,
    hydrated ? options : { ...options, timeZone: "UTC" },
  );
  return (
    <time
      dateTime={date.toISOString()}
      title={
        showTimeOnHover
          ? formatDate(
              date,
              hydrated
                ? LOCAL_DATE_TIME_FORMAT
                : { ...LOCAL_DATE_TIME_FORMAT, timeZone: "UTC" },
            )
          : undefined
      }
      className={cn("tabular-nums", !hydrated && "invisible", className)}
    >
      {text}
    </time>
  );
}
