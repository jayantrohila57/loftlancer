"use client";

import { Button } from "@loftlancer/ui/button";
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
  onStatusChange,
  onPageChange,
}: {
  status: InvitationStatusFilter;
  page: number;
  total: number;
  onStatusChange: (status: InvitationStatusFilter) => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
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
      {total > INVITATION_PAGE_SIZE ? (
        <div className="ms-auto flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={(page + 1) * INVITATION_PAGE_SIZE >= total}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
