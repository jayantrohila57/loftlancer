"use client";

import { normalizeOrgRole } from "@loftlancer/actions";
import { Avatar, AvatarFallback } from "@loftlancer/ui/avatar";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import type { DataTableEmptyConfig } from "@loftlancer/ui/data-table/data-table-empty-types";
import { LocalDateTime } from "@loftlancer/ui/patterns/local-date-time";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import {
  type LegacyColumnDef,
  legacyCreateColumnHelper,
} from "@tanstack/react-table/legacy";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  type DataTableRowAction,
  DataTableRowActions,
} from "@/components/data-table/data-table-row-actions";
import { RoleBadge } from "@/components/patterns/status-badge";
import { TableLeadingCell } from "@/components/patterns/table-leading-cell";
import { initialsFromLabel } from "@/lib/initials";

export type OrganizationMemberRow = {
  id: string;
  role: string;
  createdAt?: Date | string;
  joinedAt?: Date | string | null;
  jobTitle?: string | null;
  department?: string | null;
  suspendedAt?: Date | string | null;
  access?: {
    builtInRole: string;
    customRole: { name: string; actions: string[] } | null;
  };
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
  onViewDetails?: (member: OrganizationMemberRow) => void;
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
  onViewDetails,
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
    columnHelper.display({
      id: "organizationDetails",
      header: "Organization details",
      cell: ({ row }) => {
        const member = row.original;
        const details = [member.jobTitle, member.department].filter(Boolean);
        return (
          <span className="text-muted-foreground text-xs">
            {details.length ? details.join(" · ") : "—"}
          </span>
        );
      },
    }),
    columnHelper.accessor("role", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const member = row.original;
        const role = normalizeOrgRole(member.role) ?? "member";
        return (
          <div className="flex flex-col items-start gap-1">
            {isOwner ? (
              <SearchableCombobox
                value={role}
                onChange={(role) => onRoleChange(member.id, role)}
                disabled={
                  rolePendingId === member.id || Boolean(member.suspendedAt)
                }
                ariaLabel={`Role for ${member.user.email}`}
                className="w-32"
                options={roleSelectItems}
              />
            ) : (
              <RoleBadge role={role} />
            )}
            {member.suspendedAt ? (
              <span className="text-destructive text-xs">Suspended</span>
            ) : null}
            {member.access?.customRole ? (
              <span className="text-muted-foreground text-xs">
                {member.access.customRole.name}
              </span>
            ) : null}
          </div>
        );
      },
    }),
    columnHelper.accessor((member) => member.joinedAt ?? member.createdAt, {
      id: "joinedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Joined" />
      ),
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? (
          <span className="text-muted-foreground text-xs">
            <LocalDateTime
              value={String(value)}
              options={{ dateStyle: "medium" }}
            />
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    }),
    ...(onRemove || onViewDetails
      ? [
          columnHelper.display({
            id: "actions",
            meta: { role: "actions" },
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => {
              const member = row.original;
              const actions: DataTableRowAction[] = [];
              if (onViewDetails) {
                actions.push({
                  label: "Member details and access",
                  onSelect: () => onViewDetails(member),
                });
              }
              if (onRemove && isOwner && member.user.id !== currentUserId) {
                actions.push({
                  label:
                    removalPendingId === member.id
                      ? "Removing…"
                      : "Remove member",
                  onSelect: () => onRemove(member),
                  destructive: true,
                  disabled: removalPendingId === member.id,
                });
              }
              if (actions.length === 0) return null;
              return (
                <DataTableRowActions
                  label={`Actions for ${member.user.name || member.user.email}`}
                  actions={actions}
                />
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
