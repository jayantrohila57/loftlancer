"use client";

import type { StudioRouter } from "@loftlancer/api/routers/studio";
import { Button } from "@loftlancer/ui/button";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import { useQuery } from "@tanstack/react-query";
import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import type { inferRouterOutputs } from "@trpc/server";
import Link from "next/link";
import { useMemo } from "react";
import { appIcons } from "@/lib/icons";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

type InvitationItem =
  inferRouterOutputs<StudioRouter>["organizations"]["listMyInvitations"]["items"][number];

const columnHelper = legacyCreateColumnHelper<InvitationItem>();

export function OrganizationsListInvitations() {
  const query = useQuery(trpc.organizations.listMyInvitations.queryOptions());
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
        cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
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

  if (!query.isPending && (query.data?.items.length ?? 0) === 0) {
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
      data={query.data?.items ?? []}
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
