"use client";

import type { DataTableColumnDef } from "@loftlancer/ui/data-table/data-table";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import {
  DATA_TABLE_ACTIONS_COLUMN_ID,
  DataTableActionsColumnHeader,
} from "@loftlancer/ui/data-table/data-table-actions-column";
import type { DataTableEmptyConfig } from "@loftlancer/ui/data-table/data-table-empty-types";
import {
  LOCAL_DATE_TIME_FORMAT,
  LocalDateTime,
} from "@loftlancer/ui/patterns/local-date-time";
import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { RoleBadge, StatusBadge } from "@/components/patterns/status-badge";
import { Can } from "@/domain/permissions/components/can";
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
};

export function OrganizationInvitationsTable({
  invitations,
  empty,
  revokingId,
  resendingId,
  onRevoke,
  onResend,
  clientPagination = true,
}: OrganizationInvitationsTableProps) {
  const columns: DataTableColumnDef<OrganizationInvitationRow>[] = [
    columnHelper.accessor("email", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ getValue }) => (
        <span className="font-medium">{String(getValue())}</span>
      ),
    }),
    columnHelper.accessor("role", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ getValue }) => <RoleBadge role={String(getValue())} />,
    }),
    columnHelper.accessor("status", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ getValue }) => <StatusBadge status={String(getValue())} />,
    }),
    columnHelper.accessor("inviterName", {
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sent" />
      ),
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? (
          <span className="text-muted-foreground text-xs">
            <LocalDateTime
              value={String(value)}
              options={LOCAL_DATE_TIME_FORMAT}
            />
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    }),
    columnHelper.accessor("expiresAt", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expires" />
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-xs">
          <LocalDateTime
            value={String(getValue())}
            options={LOCAL_DATE_TIME_FORMAT}
          />
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
        return (
          <Can action="member.invite" fallback={null}>
            <DataTableRowActions
              label={`Actions for invitation to ${invite.email}`}
              actions={[
                {
                  label:
                    resendingId === invite.id
                      ? "Resending…"
                      : "Resend invitation",
                  onSelect: () => onResend(invite),
                  disabled:
                    resendingId === invite.id || revokingId === invite.id,
                },
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
              ]}
            />
          </Can>
        );
      },
    }),
  ];

  return (
    <DataTable
      columns={columns}
      data={invitations}
      caption="Organization invitations"
      captionSrOnly
      empty={empty}
      framed
      compactLayout
      enablePagination={clientPagination}
      pageSize={10}
    />
  );
}
