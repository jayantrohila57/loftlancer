import { cn } from "@loftlancer/ui/utils";
import type { ReactNode } from "react";

export const DATA_TABLE_ACTIONS_COLUMN_ID = "actions";

export function DataTableActionsColumnHeader(): ReactNode {
  return <span className="sr-only">Actions</span>;
}

export function isDataTableActionsColumn(columnDef: {
  id?: string;
  meta?: unknown;
}): boolean {
  if (columnDef.id === DATA_TABLE_ACTIONS_COLUMN_ID) {
    return true;
  }
  const meta = columnDef.meta as { role?: string } | undefined;
  return meta?.role === "actions";
}

export function dataTableActionsHeaderClassName(): string {
  return cn("w-12 text-end");
}

/** Body cell — sticky only when the table scrolls horizontally. */
export function dataTableActionsCellClassName(pinSticky: boolean): string {
  return cn(
    "w-12 text-end",
    pinSticky &&
      "before:bg-border relative sticky end-0 z-[1] bg-inherit shadow-none before:absolute before:inset-y-0 before:start-0 before:w-px before:content-['']",
  );
}
