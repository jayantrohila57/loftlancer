import { cn } from "@loftlancer/ui/utils";

/** One count badge for the whole product (sidebar counts, header bell). #266 */
export type CountBadgeTone = "muted" | "primary";

export function formatCount(count: number): string {
  return count > 99 ? "99+" : String(count);
}

/** Shared shape: pill, h-5, min-w-5, text-xs tabular. Never red. */
export function countBadgeClassName(tone: CountBadgeTone = "muted") {
  return cn(
    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs leading-none font-medium tabular-nums",
    tone === "primary"
      ? "bg-primary text-primary-foreground"
      : "bg-sidebar-accent text-sidebar-accent-foreground",
  );
}

export function CountBadge({
  count,
  tone = "muted",
  className,
}: {
  count: number;
  tone?: CountBadgeTone;
  className?: string;
}) {
  if (count <= 0) return null;
  return (
    <span className={cn(countBadgeClassName(tone), className)} aria-hidden>
      {formatCount(count)}
    </span>
  );
}
