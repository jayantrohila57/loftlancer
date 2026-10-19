"use client";

import { Avatar, AvatarFallback } from "@loftlancer/ui/avatar";
import { Button } from "@loftlancer/ui/button";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import type { DataTableEmptyConfig } from "@loftlancer/ui/data-table/data-table-empty-types";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import {
  type LegacyColumnDef,
  legacyCreateColumnHelper,
} from "@tanstack/react-table/legacy";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { RoleBadge } from "@/components/patterns/status-badge";
import { TableLeadingCell } from "@/components/patterns/table-leading-cell";
import { initialsFromLabel } from "@/lib/initials";

export type OrganizationMemberRow = {
  id: string;
  role: string;
  user: { name: string; email: string; id?: string };
};

const columnHelper = legacyCreateColumnHelper<OrganizationMemberRow>();

interface OrganizationMembersTableProps {
  members: OrganizationMemberRow[];
  roleSelectItems: { value: string; label: string }[];
  isOwner: boolean;
  rolePendingId: string | null;
  currentUserId?: string;
  removalPendingId?: string | null;
  onRoleChange: (memberId: string, role: string) => void;
  onRemove?: (member: OrganizationMemberRow) => void;
  empty?: DataTableEmptyConfig;
}

export function OrganizationMembersTable({
  members,
  roleSelectItems,
  isOwner,
  rolePendingId,
  currentUserId,
  removalPendingId,
  onRoleChange,
  onRemove,
  empty,
}: OrganizationMembersTableProps) {
  const columns = [
    columnHelper.accessor((row) => row.user.name, {
      id: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Member" />
      ),
      cell: ({ row }) => {
        const member = row.original;
        const label = member.user.name || member.user.email;
        return (
          <TableLeadingCell
            leading={
              <Avatar className="size-7">
                <AvatarFallback className="bg-muted font-medium text-[10px]">
                  {initialsFromLabel(label, "MB")}
                </AvatarFallback>
              </Avatar>
            }
          >
            <span className="block truncate font-medium">
              {member.user.name}
            </span>
            <span className="block truncate text-muted-foreground text-xs">
              {member.user.email}
            </span>
          </TableLeadingCell>
        );
      },
    }),
    columnHelper.accessor("role", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const member = row.original;
        if (!isOwner) {
          return <RoleBadge role={member.role} />;
        }

        return (
          <SearchableCombobox
            value={member.role}
            onChange={(role) => onRoleChange(member.id, role)}
            disabled={rolePendingId === member.id}
            ariaLabel={`Role for ${member.user.email}`}
            className="w-32"
            options={roleSelectItems}
          />
        );
      },
    }),
    ...(onRemove && isOwner
      ? [
          columnHelper.display({
            id: "actions",
            meta: { role: "actions" },
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => {
              const member = row.original;
              if (member.user.id === currentUserId) return null;
              return (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={removalPendingId === member.id}
                    aria-label={`Remove ${member.user.name || member.user.email}`}
                    onClick={() => onRemove(member)}
                  >
                    {removalPendingId === member.id ? "Removing…" : "Remove"}
                  </Button>
                </div>
              );
            },
          }),
        ]
      : []),
  ] as LegacyColumnDef<OrganizationMemberRow, unknown>[];

  return (
    <DataTable
      columns={columns}
      data={members}
      caption="Organization members"
      captionSrOnly
      empty={empty}
      framed
      compactLayout
      enablePagination
      pageSize={10}
    />
  );
}
