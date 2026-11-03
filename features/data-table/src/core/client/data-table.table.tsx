"use client";

import { layoutSectionStackClass } from "@features/shell/utils/shell.layout-spacing.utils";
import { Frame } from "@loftlancer/ui/frame";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@loftlancer/ui/table";
import { cn } from "@loftlancer/ui/utils";
import type { RowData } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type LegacyColumnDef,
  useLegacyTable,
} from "@tanstack/react-table/legacy";
import { ShieldAlert } from "lucide-react";
import type React from "react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import type { DataTableEmptyConfig } from "../../types/data-table.empty.types";
import {
  dataTableActionsCellClassName,
  dataTableActionsHeaderClassName,
  isDataTableActionsColumn,
} from "./data-table.actions-column";
import { DataTableEmpty } from "./data-table.empty";
import { DataTablePagination } from "./data-table.pagination";
import { resolveDataTableEmptyMarkup } from "./data-table.resolve-empty";
import { DataTableSkeletonBody } from "./data-table.skeleton-body";
import { DataTableToolbar } from "./data-table.toolbar";

export type DataTableColumnDef<TData extends RowData> = LegacyColumnDef<
  TData,
  // biome-ignore lint/suspicious/noExplicitAny: accessor value types differ per column
  any
>;

export type DataTableProps<TData extends RowData> = {
  columns: DataTableColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  /** When true, show an error empty state instead of an infinite loading skeleton. */
  isError?: boolean;
  errorTitle?: string;
  errorDescription?: string;
  /** Skeleton/empty body rows; defaults to pageSize when paginated, else 5. */
  skeletonRowCount?: number;
  /** Background refetch with data on screen: keep rows, dim them, never skeleton. */
  isFetching?: boolean;
  emptyMessage?: string;
  /** Structured empty vs no-results states (rendered inside the table frame) */
  empty?: DataTableEmptyConfig;
  /** @deprecated Prefer `empty` */
  emptyState?: ReactNode;
  /** Server-side or toolbar filters active (empty data means no results) */
  filterActive?: boolean;
  caption?: string;
  /** Visually hide table caption while keeping it for screen readers */
  captionSrOnly?: boolean;
  framed?: boolean;
  className?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filter?: ReactNode;
  toolbarTrailing?: ReactNode;
  primaryAction?: ReactNode;
  enablePagination?: boolean;
  pageSize?: number;
  /** Client-side search across row values */
  searchable?: boolean;
  /** Constrain table to parent width (responsive tables) */
  compactLayout?: boolean;
  /**
   * Server-side pagination: `data` is the current page only. Rows are not
   * sliced client-side; the pager calls `onPageChange`.
   */
  serverPagination?: {
    pageIndex: number;
    pageCount: number;
    onPageChange: (pageIndex: number) => void;
  };
  /** Whole-row click / Enter opens the row (links and buttons inside still work). */
  onRowClick?: (row: TData) => void;
  /** Accessible label for clickable rows. */
  rowLabel?: (row: TData) => string;
};

function columnClassName<TData extends RowData>(
  columnDef: DataTableColumnDef<TData>,
  pinActions: boolean,
  placement: "header" | "cell",
) {
  const meta = columnDef.meta as
    | { className?: string; headerClassName?: string }
    | undefined;
  const base =
    placement === "header"
      ? cn(meta?.headerClassName, meta?.className)
      : meta?.className;
  if (isDataTableActionsColumn(columnDef)) {
    return cn(
      base,
      placement === "header"
        ? dataTableActionsHeaderClassName()
        : dataTableActionsCellClassName(pinActions),
    );
  }
  return base;
}

function defaultGlobalFilterFn<TData extends RowData>(
  row: { original: TData },
  _columnId: string,
  filterValue: string,
) {
  const query = String(filterValue).toLowerCase().trim();
  if (!query) return true;
  const values = Object.values(row.original as Record<string, unknown>);
  return values.some((value) => {
    if (value == null) return false;
    if (typeof value === "object") {
      return JSON.stringify(value).toLowerCase().includes(query);
    }
    return String(value).toLowerCase().includes(query);
  });
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  isLoading = false,
  isError = false,
  errorTitle = "Could not load data",
  errorDescription = "Something went wrong. Try refreshing the page.",
  skeletonRowCount: skeletonRowCountProp,
  isFetching = false,
  emptyMessage = "No results.",
  empty,
  emptyState,
  filterActive = false,
  caption,
  captionSrOnly = false,
  framed = false,
  className,
  searchPlaceholder,
  searchValue: searchValueProp,
  onSearchChange: onSearchChangeProp,
  filter,
  toolbarTrailing,
  primaryAction,
  enablePagination = false,
  pageSize = 10,
  searchable = false,
  compactLayout = false,
  serverPagination,
  onRowClick,
  rowLabel,
}: DataTableProps<TData>) {
  const paginated = enablePagination || Boolean(serverPagination);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pinActions, setPinActions] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");
  const searchEnabled =
    searchable ||
    onSearchChangeProp !== undefined ||
    searchValueProp !== undefined;
  const searchValue = searchEnabled
    ? (searchValueProp ?? internalSearch)
    : undefined;
  const onSearchChange = searchEnabled
    ? (onSearchChangeProp ?? setInternalSearch)
    : undefined;

  const showToolbar =
    searchEnabled ||
    Boolean(filter) ||
    Boolean(toolbarTrailing) ||
    Boolean(primaryAction);

  const table = useLegacyTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel:
      enablePagination && !serverPagination
        ? getPaginationRowModel()
        : undefined,
    globalFilterFn: defaultGlobalFilterFn,
    state: {
      // Server-paginated tables search on the server; don't re-filter the page.
      globalFilter:
        searchEnabled && !serverPagination ? searchValue : undefined,
    },
    onGlobalFilterChange: onSearchChange,
    initialState: {
      pagination: { pageIndex: 0, pageSize },
    },
  });

  const columnCount = columns.length;
  const skeletonRowCount = skeletonRowCountProp ?? (paginated ? pageSize : 5);
  // First load only: once rows exist, a refetch keeps them (placeholderData).
  const showSkeleton = isLoading && data.length === 0;
  const refetching = !showSkeleton && (isFetching || isLoading);
  const rowModel = table.getRowModel();
  const hasRows = rowModel.rows.length > 0;

  // biome-ignore lint/correctness/useExhaustiveDependencies: the listed values are re-measure triggers; the table element can be replaced when columns, rows or the skeleton change, so the observer must re-attach.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkOverflow = () => {
      setPinActions(el.scrollWidth > el.clientWidth + 1);
    };

    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);
    const tableEl = el.querySelector("[data-slot=table]");
    if (tableEl instanceof HTMLElement) {
      observer.observe(tableEl);
    }
    return () => observer.disconnect();
  }, [columns, data, showSkeleton, hasRows, rowModel.rows.length]);

  const showEmpty = !showSkeleton && !isError && !hasRows;
  const showError = isError && !showSkeleton && !hasRows;
  const hasClientSearch = Boolean(
    searchEnabled && String(searchValue ?? "").trim(),
  );
  const emptyVariant: "empty" | "noResults" =
    data.length > 0 && !hasRows
      ? "noResults"
      : data.length === 0 && (filterActive || hasClientSearch)
        ? "noResults"
        : "empty";

  const errorMarkup = showError ? (
    <DataTableEmpty
      compact
      icon={ShieldAlert}
      title={errorTitle}
      description={errorDescription}
    />
  ) : null;

  const emptyMarkup =
    emptyState ??
    (showError
      ? errorMarkup
      : showEmpty
        ? resolveDataTableEmptyMarkup({
            config: empty,
            variant: emptyVariant,
            onClearSearch:
              onSearchChange && hasClientSearch
                ? () => onSearchChange("")
                : undefined,
            fallbackTitle: emptyMessage,
          })
        : null);

  const tableMarkup = (
    <Table
      variant="card"
      containerRef={scrollRef}
      className={cn(compactLayout && "table-fixed")}
    >
      {caption ? (
        <TableCaption className={cn(captionSrOnly && "sr-only")}>
          {caption}
        </TableCaption>
      ) : null}
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={columnClassName(
                  header.column.columnDef,
                  pinActions,
                  "header",
                )}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody
        aria-busy={showSkeleton || refetching || undefined}
        className={cn(
          "transition-opacity motion-reduce:transition-none",
          refetching && "opacity-60",
        )}
      >
        {showSkeleton ? (
          <DataTableSkeletonBody
            columnClassNames={columns.map((c) =>
              columnClassName(c, pinActions, "cell"),
            )}
            rows={skeletonRowCount}
          />
        ) : hasRows ? (
          rowModel.rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() ? "selected" : undefined}
              {...(onRowClick
                ? {
                    tabIndex: 0,
                    "aria-label": rowLabel?.(row.original),
                    className:
                      "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    onClick: (e: React.MouseEvent<HTMLTableRowElement>) => {
                      const target = e.target as HTMLElement;
                      if (
                        target.closest(
                          "a,button,input,[role=menuitem],[data-row-click-ignore]",
                        )
                      )
                        return;
                      onRowClick(row.original);
                    },
                    onKeyDown: (
                      e: React.KeyboardEvent<HTMLTableRowElement>,
                    ) => {
                      if (e.key === "Enter" && e.target === e.currentTarget) {
                        e.preventDefault();
                        onRowClick(row.original);
                      }
                    },
                  }
                : {})}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={columnClassName(
                    cell.column.columnDef,
                    pinActions,
                    "cell",
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={columnCount}
              className="p-0"
              // Same body height as the skeleton/ready state (40px rows).
              style={{ height: `${Math.min(skeletonRowCount, 5) * 2.5}rem` }}
            >
              {emptyMarkup ?? (
                <p className="text-muted-foreground px-4 py-6 text-center text-sm">
                  {emptyMessage}
                </p>
              )}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const body = (
    <div className={cn(layoutSectionStackClass, className)}>
      {showToolbar ? (
        <DataTableToolbar
          searchPlaceholder={searchPlaceholder}
          searchValue={onSearchChange ? searchValue : undefined}
          onSearchChange={onSearchChange}
          filter={filter}
          trailing={toolbarTrailing}
          primaryAction={primaryAction}
        />
      ) : null}
      {framed ? (
        <Frame className="w-full max-w-full min-w-0 overflow-hidden rounded-xl">
          {tableMarkup}
        </Frame>
      ) : (
        <div
          className={cn(compactLayout && "max-w-full min-w-0 overflow-x-auto")}
        >
          {tableMarkup}
        </div>
      )}
      {serverPagination ? (
        <DataTablePagination
          table={{
            getPageCount: () => serverPagination.pageCount,
            getState: () => ({
              pagination: { pageIndex: serverPagination.pageIndex },
            }),
            previousPage: () =>
              serverPagination.onPageChange(
                Math.max(serverPagination.pageIndex - 1, 0),
              ),
            nextPage: () =>
              serverPagination.onPageChange(serverPagination.pageIndex + 1),
            getCanPreviousPage: () => serverPagination.pageIndex > 0,
            getCanNextPage: () =>
              serverPagination.pageIndex + 1 < serverPagination.pageCount,
          }}
          disabled={showSkeleton}
        />
      ) : enablePagination ? (
        <DataTablePagination table={table} disabled={showSkeleton} />
      ) : null}
    </div>
  );

  return body;
}
