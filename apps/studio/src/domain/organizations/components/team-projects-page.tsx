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
  const linked = useQuery(trpc.teams.projects.queryOptions({ teamId }));
  const linkable = useQuery(
    trpc.teams.linkableProjects.queryOptions({ teamId }),
  );
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
        toast.success("Team linked to project");
        invalidate();
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const remove = useMutation(
    trpc.projectAccess.removeTeam.mutationOptions({
      onSuccess: () => {
        toast.success("Team unlinked from project");
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
        <Link
          href={routes.project(slug, row.original.slug)}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "slug",
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
                label: "Unlink team",
                destructive: true,
                disabled: remove.isPending,
                onSelect: () =>
                  confirm({
                    title: `Unlink ${row.original.name}?`,
                    description:
                      "Team members will lose access from this link. Direct grants stay saved, but need another linked team to be effective. Project manager assignments stay in place.",
                    confirmLabel: "Unlink project",
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
    <section className="space-y-4">
      <div>
        <h2 className="font-semibold text-xl tracking-tight">Projects</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Linking this team gives its members the default project read grants.
          Unlinking removes this team as an access source. Direct grants stay
          saved, but a member needs another linked team for those grants to be
          effective.
        </p>
      </div>
      {linkable.isError ? (
        <ErrorState
          title="Could not load available projects"
          description="Try loading the projects again."
          onRetry={() => void linkable.refetch()}
        />
      ) : linkable.isPending ? (
        <Skeleton className="h-16 rounded-xl" />
      ) : available.length > 0 ? (
        <div className="flex flex-wrap items-end gap-2 rounded-xl border bg-card p-4">
          <SearchableCombobox
            value={projectId}
            onChange={setProjectId}
            ariaLabel="Project to link"
            placeholder="Select a project"
            searchPlaceholder="Search projects…"
            className="w-64"
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
              Link project
            </Button>
          </Can>
        </div>
      ) : null}
      {linked.isError ? (
        <ErrorState
          title="Could not load linked projects"
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
          caption="Projects linked to this team"
          captionSrOnly
          searchPlaceholder="Search projects…"
          emptyMessage="This team is not linked to any projects yet."
        />
      )}
      {ConfirmDialog}
    </section>
  );
}
