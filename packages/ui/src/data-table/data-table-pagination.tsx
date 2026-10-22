"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { layoutGapClass } from "../lib/layout-spacing";
import { cn } from "../lib/utils";

type PaginatedTable = {
  getPageCount: () => number;
  getState: () => { pagination: { pageIndex: number } };
  previousPage: () => void;
  nextPage: () => void;
  getCanPreviousPage: () => boolean;
  getCanNextPage: () => boolean;
};

export function DataTablePagination({
  table,
  className,
  disabled = false,
}: {
  table: PaginatedTable;
  className?: string;
  /** Loading: keep the bar (same height) with controls disabled. */
  disabled?: boolean;
}) {
  // Always rendered so the table never changes height between states.
  const pageCount = Math.max(table.getPageCount(), 1);
  const pageIndex = Math.min(
    table.getState().pagination.pageIndex,
    pageCount - 1,
  );

  return (
    <div
      className={cn(
        "flex items-center justify-between text-muted-foreground text-xs",
        layoutGapClass,
        className,
      )}
    >
      <span className="tabular-nums">
        Page {pageIndex + 1} of {pageCount}
      </span>
      <div className={cn("flex items-center", layoutGapClass)}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 px-2 sm:h-8 sm:px-3"
          aria-label="Previous page"
          onClick={() => table.previousPage()}
          disabled={disabled || !table.getCanPreviousPage()}
        >
          <ChevronLeft className="size-4" aria-hidden />
          <span className="sr-only sm:not-sr-only">Previous</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 px-2 sm:h-8 sm:px-3"
          aria-label="Next page"
          onClick={() => table.nextPage()}
          disabled={disabled || !table.getCanNextPage()}
        >
          <span className="sr-only sm:not-sr-only">Next</span>
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
