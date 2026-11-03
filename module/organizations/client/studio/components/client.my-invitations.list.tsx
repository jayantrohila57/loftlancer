"use client";

import { Button } from "@loftlancer/ui/button";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import { LocalDateTime } from "@loftlancer/ui/patterns/local-date-time";
import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import Link from "next/link";
import { useMemo } from "react";
import { ErrorState } from "@/components/patterns/error-state";
import { appIcons } from "@/lib/icons";
import { routes } from "@/utils/navigation";
import type { OrganizationMyInvitationsOutput } from "../../../utils/validation/utils.organization-invitations.validation";
import { useMyOrganizationInvitations } from "../hooks/client.use-my-organization-invitations.hook";

type InvitationItem = OrganizationMyInvitationsOutput["items"][number];
const columnHelper = legacyCreateColumnHelper<InvitationItem>();

export function MyOrganizationInvitationsList() {
  const query = useMyOrganizationInvitations();
  const items =
    query.data?.status === "success" &&
    query.data.data !== null &&
    !Array.isArray(query.data.data)
      ? query.data.data.items
      : [];
  const columns = useMemo(
    () => [
      columnHelper.accessor("organizationName", {
        header: "Organization",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">
              {row.original.organizationName}
            </div>
            <div className="truncate text-muted-foreground text-xs">
              Invited by {row.original.inviterName ?? "an organization member"}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("role", {
        header: "Role",
        cell: ({ getValue }) => (
          <span className="capitalize">{getValue()}</span>
        ),
      }),
      columnHelper.accessor("expiresAt", {
        header: "Expires",
        cell: ({ getValue }) => (
          <LocalDateTime value={getValue()} showTimeOnHover />
        ),
      }),
      columnHelper.display({
        id: "action",
        header: "",
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            render={<Link href={routes.invitation(row.original.id)} />}
          >
            Review invitation
          </Button>
        ),
      }),
    ],
    [],
  );

  if (query.isError || (query.data && query.data.status !== "success")) {
    return (
      <ErrorState
        title="Invitations unavailable"
        description="Could not load invitations sent to you."
        onRetry={() => void query.refetch()}
      />
    );
  }
  if (!query.isPending && items.length === 0) {
    return (
      <EmptyState
        icon={appIcons.invite}
        title="No pending invitations"
        description="Invitations sent to your verified email address will appear here."
      />
    );
  }
  return (
    <DataTable
      data={items}
      columns={columns}
      isLoading={query.isPending}
      caption="Invitations sent to you"
      captionSrOnly
      framed
      compactLayout
      enablePagination
      pageSize={10}
    />
  );
}
