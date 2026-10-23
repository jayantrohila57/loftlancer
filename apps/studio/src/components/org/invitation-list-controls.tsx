"use client";

import { DataTablePagination } from "@loftlancer/ui/data-table/data-table-pagination";
import { DataTableToolbar } from "@loftlancer/ui/data-table/data-table-toolbar";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";

export const INVITATION_PAGE_SIZE = 50;
export const INVITATION_STATUSES = [
  "pending",
  "expired",
  "accepted",
  "rejected",
  "canceled",
  "all",
] as const;
export type InvitationStatusFilter = (typeof INVITATION_STATUSES)[number];

export function InvitationListControls({
  status,
  page,
  total,
  search,
  onStatusChange,
  onPageChange,
  onSearchChange,
}: {
  status: InvitationStatusFilter;
  page: number;
  total: number;
  search: string;
  onStatusChange: (status: InvitationStatusFilter) => void;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
}) {
  return (
    <DataTableToolbar
      searchPlaceholder="Search invitations by email…"
      searchValue={search}
      onSearchChange={onSearchChange}
      filter={
        <SearchableCombobox
          value={status}
          onChange={(value) => onStatusChange(value as InvitationStatusFilter)}
          ariaLabel="Filter invitations by status"
          className="w-44"
          options={INVITATION_STATUSES.map((value) => ({
            value,
            label: value.charAt(0).toUpperCase() + value.slice(1),
          }))}
        />
      }
      trailing={
        <DataTablePagination
          table={{
            getPageCount: () =>
              Math.max(1, Math.ceil(total / INVITATION_PAGE_SIZE)),
            getState: () => ({ pagination: { pageIndex: page } }),
            previousPage: () => onPageChange(Math.max(page - 1, 0)),
            nextPage: () => onPageChange(page + 1),
            getCanPreviousPage: () => page > 0,
            getCanNextPage: () => (page + 1) * INVITATION_PAGE_SIZE < total,
          }}
        />
      }
    />
  );
}
