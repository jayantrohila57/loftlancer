"use client";

import { Button } from "@loftlancer/ui/button";
import type { RowData } from "@tanstack/react-table";
import type { LegacyColumn } from "@tanstack/react-table/legacy";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

interface DataTableColumnHeaderProps<TData extends RowData, TValue = unknown> {
  column: LegacyColumn<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData extends RowData, TValue = unknown>({
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span>{title}</span>;
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      {sorted === "desc" ? (
        <ArrowDown className="size-4" aria-hidden />
      ) : sorted === "asc" ? (
        <ArrowUp className="size-4" aria-hidden />
      ) : (
        <ChevronsUpDown className="size-4" aria-hidden />
      )}
    </Button>
  );
}
