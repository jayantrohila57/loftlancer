"use client";

import { useHydrated } from "@features/patterns/core/client/patterns.use-hydrated.hook";
import { formatDate } from "@/lib/format";
import { formatRelativeShort } from "@/lib/format-relative-short";

/**
 * Relative time ("Today", "3d ago") computed in the viewer's timezone. The
 * server and the hydration pass render a deterministic UTC date invisibly
 * (reserving the slot), so there is no mismatch and no visible swap (#325,
 * #327); client-side navigations render the relative label immediately.
 */
export function ClientRelativeTime({
  value,
  fallbackFormat = { month: "short", day: "numeric", year: "numeric" },
}: {
  value: Date | string | number;
  fallbackFormat?: Intl.DateTimeFormatOptions;
}) {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <span className="invisible">
        {formatDate(value, { ...fallbackFormat, timeZone: "UTC" })}
      </span>
    );
  }
  return <span>{formatRelativeShort(value)}</span>;
}
