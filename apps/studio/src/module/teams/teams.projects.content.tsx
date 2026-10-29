"use client";

import { Button } from "@loftlancer/ui/button";
import type { DataTableColumnDef } from "@loftlancer/ui/data-table/data-table";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import { DataTableActionsColumnHeader } from "@loftlancer/ui/data-table/data-table-actions-column";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { ErrorState } from "@/components/patterns/error-state";
import { Can } from "@/domain/permissions/components/can";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "@/lib/toast";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

export function TeamProjectsPage({
  slug,
  teamId,
}: {
  slug: string;
  teamId: string;
}) {
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();
  const [projectId, setProjectId] = useState("");
  const canManageProjectLinks = useCan("member.list");
  const linked = useQuery(trpc.teams.projects.queryOptions({ teamId }));
  const linkable = useQuery({
    ...trpc.teams.linkableProjects.queryOptions({ teamId }),
    enabled: canManageProjectLinks.allowed,
  });
  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: trpc.teams.projects.queryKey({ teamId }),
    });
    void queryClient.invalidateQueries({
      queryKey: trpc.teams.linkableProjects.queryKey({ teamId }),
    });
    void queryClient.invalidateQueries({
      queryKey: trpc.projectAccess.getSummary.pathKey(),
    });
    void queryClient.invalidateQueries({
      queryKey: trpc.permissions.snapshot.queryKey({}),
    });
  };
  const assign = useMutation(
    trpc.projectAccess.assignTeam.mutationOptions({
      onSuccess: () => {
        setProjectId("");
        toast.success("Team added to project");
        invalidate();
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const remove = useMutation(
    trpc.projectAccess.removeTeam.mutationOptions({
      onSuccess: () => {
        toast.success("Team removed from project");
        invalidate();
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const linkedIds = new Set(linked.data?.items.map((item) => item.id) ?? []);
  const available = (linkable.data?.items ?? []).filter(
    (item) => !linkedIds.has(item.id),
  );
  const projectRows = linked.data?.items ?? [];
  const columns: DataTableColumnDef<(typeof projectRows)[number]>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Project" />
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <Link
            href={routes.project(slug, row.original.slug)}
            className="block truncate font-medium hover:underline"
          >
            {row.original.name}
          </Link>
          <span className="block truncate text-muted-foreground text-xs sm:hidden">
            /{slug}/{row.original.slug}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "slug",
      meta: { className: "hidden sm:table-cell" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Project URL" />
      ),
    },
    {
      id: "actions",
      meta: { role: "actions" },
      header: () => <DataTableActionsColumnHeader />,
      cell: ({ row }) => (
        <Can action="project.assign_team" projectId={row.original.id}>
          <DataTableRowActions
            label={`Actions for ${row.original.name}`}
            actions={[
              {
                label: "Remove team access",
                destructive: true,
                disabled: remove.isPending,
                onSelect: () =>
                  confirm({
                    title: `Remove ${row.original.name} from this project?`,
                    description:
                      "Team members may lose project access. Individual access settings stay saved and apply while at least one team has access. Project managers keep their access.",
                    confirmLabel: "Remove team",
                    variant: "destructive",
                    onConfirm: async () => {
                      await remove.mutateAsync({
                        projectId: row.original.id,
                        teamId,
                      });
                    },
                  }),
              },
            ]}
          />
        </Can>
      ),
    },
  ];

  return (
    <>
      {linkable.isError ? (
        <ErrorState
          title="Could not load available projects"
          description="Try loading the projects again."
          onRetry={() => void linkable.refetch()}
        />
      ) : canManageProjectLinks.allowed && linkable.isPending ? (
        <Skeleton className="h-16 rounded-xl" />
      ) : available.length > 0 ? (
        <div className="flex flex-wrap items-end gap-2 rounded-xl border bg-card p-4">
          <SearchableCombobox
            value={projectId}
            onChange={setProjectId}
            ariaLabel="Project to add"
            placeholder="Select a project"
            searchPlaceholder="Search projects…"
            className="w-full sm:w-64"
            options={available.map((item) => ({
              value: item.id,
              label: item.name,
              hint: item.slug,
            }))}
          />
          <Can action="project.assign_team" projectId={projectId}>
            <Button
              type="button"
              size="sm"
              disabled={!projectId || assign.isPending}
              onClick={() => assign.mutate({ projectId, teamId })}
            >
              Add project
            </Button>
          </Can>
        </div>
      ) : null}
      {linked.isError ? (
        <ErrorState
          title="Could not load projects with team access"
          description="Try loading the team projects again."
          onRetry={() => void linked.refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={projectRows}
          isLoading={linked.isPending}
          searchable
          enablePagination
          pageSize={10}
          framed
          compactLayout
          caption="Projects with team access"
          captionSrOnly
          searchPlaceholder="Search projects…"
          emptyMessage="This team has no project access yet."
        />
      )}
      {ConfirmDialog}
    </>
  );
}
