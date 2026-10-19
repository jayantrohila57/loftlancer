import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@loftlancer/ui/card";
import { layoutGapClass } from "@loftlancer/ui/layout-spacing";
import { Skeleton } from "@loftlancer/ui/skeleton";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import type { AppIconName } from "@/lib/icons";
import { cn } from "@/lib/utils";

export type StatCardItem = {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: AppIconName;
  /** Makes the whole card a real link (cmd-click opens a new tab). */
  href?: Route;
};

/* Shared by the card and its skeleton so loading never shifts layout. */
const headerClass = (compact?: boolean) =>
  cn(
    "gap-0.5 pb-0",
    compact ? "gap-0.5 p-2 sm:p-2.5 sm:pb-2" : "gap-1 p-3 pb-1 sm:p-4 sm:pb-1",
  );
const iconClass = (compact?: boolean) =>
  compact ? "size-3.5 sm:size-4" : "size-4";
const titleClass = (compact?: boolean) =>
  cn(
    "truncate text-nowrap tabular-nums",
    compact ? "text-base" : "text-xl sm:text-2xl",
  );
const hintClass = (compact?: boolean) =>
  cn(
    "truncate text-nowrap pt-0 text-muted-foreground text-xs",
    compact ? "hidden" : "px-3 pb-3 sm:px-4 sm:pb-4",
  );

function StatCardInner({
  item,
  compact,
  interactive,
}: {
  item: StatCardItem;
  compact?: boolean;
  interactive?: boolean;
}) {
  return (
    <Card
      className={cn(
        "h-full",
        interactive &&
          "transition-colors group-hover:border-primary/30 group-hover:bg-muted/30",
      )}
    >
      <CardHeader className={headerClass(compact)}>
        <div className="flex items-start justify-between gap-2">
          <CardDescription className="text-xs">{item.label}</CardDescription>
          <AppIcon name={item.icon} className={iconClass(compact)} />
        </div>
        <CardTitle className={titleClass(compact)}>{item.value}</CardTitle>
      </CardHeader>
      {item.hint ? (
        <CardPanel className={hintClass(compact)}>{item.hint}</CardPanel>
      ) : null}
    </Card>
  );
}

export function StatCard({
  item,
  className,
  compact,
}: {
  item: StatCardItem;
  className?: string;
  compact?: boolean;
}) {
  if (item.href) {
    return (
      <Link
        href={item.href}
        className={cn(
          "group block min-w-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
      >
        <StatCardInner item={item} compact={compact} interactive />
      </Link>
    );
  }

  return (
    <div className={cn("min-w-0", className)}>
      <StatCardInner item={item} compact={compact} />
    </div>
  );
}

export function StatCardRow({
  items,
  className,
  compact,
}: {
  items: StatCardItem[];
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 lg:grid-cols-4",
        layoutGapClass,
        className,
      )}
    >
      {items.map((item) => (
        <StatCard key={item.label} item={item} compact={compact} />
      ))}
    </div>
  );
}

const STAT_SKELETON_SLOTS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

/** Same footprint as {@link StatCardRow}; pass the same `compact` flag. */
export function StatCardRowSkeleton({
  count = 4,
  className,
  compact,
}: {
  count?: number;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 lg:grid-cols-4",
        layoutGapClass,
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading…</span>
      {STAT_SKELETON_SLOTS.slice(0, count).map((slot) => (
        <div key={slot} className="min-w-0" aria-hidden>
          <Card className="h-full">
            <CardHeader className={headerClass(compact)}>
              <div className="flex items-start justify-between gap-2">
                <CardDescription className="flex h-4 items-center text-xs">
                  <Skeleton className="h-3 w-16" />
                </CardDescription>
                <Skeleton className={cn("rounded-sm", iconClass(compact))} />
              </div>
              <CardTitle
                className={cn(titleClass(compact), "flex items-center")}
              >
                <span className="invisible w-0">0</span>
                <Skeleton className="h-[0.75em] w-12" />
              </CardTitle>
            </CardHeader>
            <CardPanel className={hintClass(compact)}>
              <span className="flex h-4 items-center">
                <Skeleton className="h-3 w-24" />
              </span>
            </CardPanel>
          </Card>
        </div>
      ))}
    </div>
  );
}
