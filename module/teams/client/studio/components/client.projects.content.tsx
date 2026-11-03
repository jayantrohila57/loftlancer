"use client";

import { Button } from "@loftlancer/ui/button";
import type { DataTableColumnDef } from "@loftlancer/ui/data-table/data-table";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import { DataTableActionsColumnHeader } from "@loftlancer/ui/data-table/data-table-actions-column";
import { DataTableColumnHeader } from "@loftlancer/ui/data-table/data-table-column-header";
import { DataTableRowActions } from "@loftlancer/ui/data-table/data-table-row-actions";
import { PageStatusError as ErrorState } from "@loftlancer/ui/patterns/page-state";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import { Skeleton } from "@loftlancer/ui/skeleton";
import type { Route } from "next";
import Link from "next/link";
import { routes } from "../config/client.routes";
import type { useTeamProjectsScreen } from "../hooks/client.use-teams-projects-screen.hook";
import { Can } from "./client.can";

export function TeamProjectsContent({
  slug,
  teamId,
  state,
}: {
  slug: string;
  teamId: string;
  state: ReturnType<typeof useTeamProjectsScreen>;
}) {
  const {
    linked,
    linkable,
    assign,
    remove,
    projectId,
    setProjectId,
    canManageProjectLinks,
    confirm,
    ConfirmDialog,
  } = state;
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
            href={routes.project(slug, row.original.slug) as Route}
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
        <Can
          fallback={null}
          action="project.assign_team"
          projectId={row.original.id}
        >
          <DataTableRowActions
            label={`Actions for ${row.original.name}`}
            actions={[
              {
                label: "Remove team access",
                destructive: true,
                disabled: remove.isPending,
                onSelect: () =>
                  confirm({
                    title: `Remove this team from ${row.original.name}?`,
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
          <Can
            fallback={null}
            action="project.assign_team"
            projectId={projectId}
          >
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
