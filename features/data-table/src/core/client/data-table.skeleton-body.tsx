"use client";

import { Skeleton } from "@loftlancer/ui/skeleton";
import { TableCell, TableRow } from "@loftlancer/ui/table";
import { cn } from "@loftlancer/ui/utils";

interface DataTableSkeletonBodyProps {
  /** One entry per real column: the same cell classes, so widths match. */
  columnClassNames: (string | undefined)[];
  rows?: number;
}

// Varied, fixed widths so the skeleton reads like real text, not bars.
const WIDTHS = ["w-32", "w-24", "w-20", "w-28", "w-16"];

/**
 * Mirrors the ready table 1:1: one row per page slot at the real 40px row
 * height, one cell per column with the column's own classes.
 */
export function DataTableSkeletonBody({
  columnClassNames,
  rows = 5,
}: DataTableSkeletonBodyProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows
        <TableRow key={`skeleton-row-${r}`} className="h-10">
          {columnClassNames.map((cellClass, c) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder cells
            <TableCell key={`skeleton-cell-${r}-${c}`} className={cellClass}>
              {r === 0 && c === 0 ? (
                <span className="sr-only">Loading…</span>
              ) : null}
              <Skeleton
                className={cn(
                  "h-4 max-w-full motion-reduce:animate-none",
                  WIDTHS[(r + c) % WIDTHS.length],
                )}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
