"use client";

import type { DataTableColumnDef } from "@loftlancer/ui/data-table/data-table";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import {
  DATA_TABLE_ACTIONS_COLUMN_ID,
  DataTableActionsColumnHeader,
} from "@loftlancer/ui/data-table/data-table-actions-column";
import type { DataTableEmptyConfig } from "@loftlancer/ui/data-table/data-table-empty-types";
import { LocalDateTime } from "@loftlancer/ui/patterns/local-date-time";
import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { RoleBadge, StatusBadge } from "@/components/patterns/status-badge";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import {
  isPendingInvitationStatus,
  type OrganizationInvitationRow,
} from "@/lib/organization-invitations";

const columnHelper = legacyCreateColumnHelper<OrganizationInvitationRow>();

export type OrganizationInvitationsTableProps = {
  invitations: OrganizationInvitationRow[];
  empty?: DataTableEmptyConfig;
  revokingId: string | null;
  resendingId: string | null;
  onRevoke: (invitationId: string) => void;
  onResend: (invite: OrganizationInvitationRow) => void;
  /** Off when the caller paginates server-side (#261). */
  clientPagination?: boolean;
  caption?: string;
  /** Project invitations also require the project grant permission. */
  projectId?: string;
  scopeLabel?: string;
};

export function OrganizationInvitationsTable({
  invitations,
  empty,
  revokingId,
  resendingId,
  onRevoke,
  onResend,
  clientPagination = true,
  caption = "Organization invitations",
  projectId,
  scopeLabel = "Organization",
}: OrganizationInvitationsTableProps) {
  const invitePermission = useCan("member.invite", { projectId });
  const revokePermission = useCan("invitation.cancel", { projectId });
  const columns: DataTableColumnDef<OrganizationInvitationRow>[] = [
    columnHelper.display({
      id: "scope",
      meta: { className: "hidden sm:table-cell" },
      header: "Access scope",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {scopeLabel}
          {row.original.teamName ? `: ${row.original.teamName}` : ""}
        </span>
      ),
    }),
    columnHelper.accessor("email", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <span
            className="block max-w-56 truncate font-medium"
            title={row.original.email}
          >
            {row.original.email}
          </span>
          <span className="block truncate text-muted-foreground text-xs sm:hidden">
            {scopeLabel}
            {row.original.teamName ? `: ${row.original.teamName}` : ""}
          </span>
          {scopeLabel === "Team" && row.original.linkedProjects?.length ? (
            <span className="block truncate text-muted-foreground text-xs lg:hidden">
              Projects: {row.original.linkedProjects.join(", ")}
            </span>
          ) : null}
        </div>
      ),
    }),
    columnHelper.accessor("role", {
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={scopeLabel === "Team" ? "Organization role" : "Role"}
        />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col items-start gap-1">
          <RoleBadge role={row.original.role} />
          {scopeLabel === "Team" ? (
            <span className="text-muted-foreground text-xs sm:hidden">
              Team: {row.original.invitedTeamRole ?? "Member"}
            </span>
          ) : null}
        </div>
      ),
    }),
    ...(scopeLabel === "Team"
      ? [
          columnHelper.display({
            id: "invitedTeamRole",
            meta: { className: "hidden sm:table-cell" },
            header: "Invited team role",
            cell: ({ row }) => (
              <RoleBadge role={row.original.invitedTeamRole ?? "member"} />
            ),
          }),
          columnHelper.display({
            id: "linkedProjects",
            meta: { className: "hidden lg:table-cell" },
            header: "Project access",
            cell: ({ row }) => (
              <span className="text-muted-foreground">
                {row.original.linkedProjects?.length
                  ? row.original.linkedProjects.join(", ")
                  : "No projects linked"}
              </span>
            ),
          }),
        ]
      : []),
    columnHelper.accessor("status", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ getValue }) => <StatusBadge status={String(getValue())} />,
    }),
    columnHelper.accessor("inviterName", {
      meta: { className: "hidden lg:table-cell" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invited by" />
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {String(getValue() || "Organization admin")}
        </span>
      ),
    }),
    columnHelper.accessor("createdAt", {
      meta: { className: "hidden md:table-cell" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sent" />
      ),
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? (
          <span className="text-muted-foreground text-xs">
            <LocalDateTime value={String(value)} showTimeOnHover />
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    }),
    columnHelper.display({
      id: "lifecycle",
      meta: { className: "hidden xl:table-cell" },
      header: "Activity",
      cell: ({ row }) => {
        const invite = row.original;
        const date =
          invite.acceptedAt ??
          invite.rejectedAt ??
          invite.revokedAt ??
          invite.lastSentAt ??
          invite.updatedAt;
        const label = invite.acceptedAt
          ? "Accepted"
          : invite.rejectedAt
            ? "Declined"
            : invite.revokedAt
              ? "Revoked"
              : invite.lastSentAt
                ? "Last sent"
                : "Updated";
        return date ? (
          <span className="text-muted-foreground text-xs">
            {label}: <LocalDateTime value={String(date)} showTimeOnHover />
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    }),
    columnHelper.accessor("expiresAt", {
      meta: { className: "hidden xl:table-cell" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expires" />
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-xs">
          <LocalDateTime value={String(getValue())} showTimeOnHover />
        </span>
      ),
    }),
    columnHelper.display({
      id: DATA_TABLE_ACTIONS_COLUMN_ID,
      meta: { role: "actions" },
      header: () => <DataTableActionsColumnHeader />,
      cell: ({ row }) => {
        const invite = row.original;
        if (!isPendingInvitationStatus(invite.status)) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }
        const actions = [
          ...(invitePermission.allowed
            ? [
                {
                  label:
                    resendingId === invite.id
                      ? "Resending…"
                      : "Resend invitation",
                  onSelect: () => onResend(invite),
                  disabled:
                    resendingId === invite.id || revokingId === invite.id,
                },
              ]
            : []),
          ...(revokePermission.allowed
            ? [
                {
                  label:
                    revokingId === invite.id
                      ? "Revoking…"
                      : "Revoke invitation",
                  onSelect: () => onRevoke(invite.id),
                  destructive: true,
                  disabled:
                    revokingId === invite.id || resendingId === invite.id,
                },
              ]
            : []),
        ];
        return actions.length ? (
          <DataTableRowActions
            label={`Actions for invitation to ${invite.email}`}
            actions={actions}
          />
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );
      },
    }),
  ];

  return (
    <DataTable
      columns={columns}
      data={invitations}
      caption={caption}
      captionSrOnly
      empty={empty}
      framed
      compactLayout
      enablePagination={clientPagination}
      pageSize={10}
    />
  );
}
