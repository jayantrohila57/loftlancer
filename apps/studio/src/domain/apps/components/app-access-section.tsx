"use client";

import { Button } from "@loftlancer/ui/button";
import type { DataTableColumnDef } from "@loftlancer/ui/data-table/data-table";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import { DataTableActionsColumnHeader } from "@loftlancer/ui/data-table/data-table-actions-column";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { AccordionSectionSkeleton } from "@loftlancer/ui/patterns/accordion-section-skeleton";
import { ConfirmDialog } from "@loftlancer/ui/patterns/confirm-dialog";
import { LoadingButton } from "@loftlancer/ui/patterns/loading-button";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { ErrorState } from "@/components/patterns/error-state";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";

type AppAccessSectionProps = {
  projectId: string;
  appId: string;
  appName: string;
};

export function AppAccessSection({
  projectId,
  appId,
  appName,
}: AppAccessSectionProps) {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [confirmRestricted, setConfirmRestricted] = useState(false);
  const access = useQuery(
    trpc.projectApps.accessSummary.queryOptions({ projectId, appId }),
  );
  const projectAccess = useQuery(
    trpc.projectAccess.getSummary.queryOptions({ projectId }),
  );
  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: trpc.projectApps.accessSummary.queryKey({ projectId, appId }),
      }),
      queryClient.invalidateQueries({
        queryKey: trpc.projectApps.list.queryKey({ projectId }),
      }),
      queryClient.invalidateQueries({
        queryKey: trpc.permissions.snapshot.queryKey({ projectId }),
      }),
    ]);
  };
  const setMode = useMutation(
    trpc.projectApps.setAccessMode.mutationOptions({
      onSuccess: async () => {
        setConfirmRestricted(false);
        await invalidate();
        toast.success("App access updated");
      },
      onError: () => toast.error("Could not update app access"),
    }),
  );
  const grant = useMutation(
    trpc.projectApps.grantAccess.mutationOptions({
      onSuccess: async () => {
        setUserId("");
        setTeamId("");
        await invalidate();
        toast.success("App access granted");
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const revoke = useMutation(
    trpc.projectApps.revokeAccess.mutationOptions({
      onSuccess: async () => {
        await invalidate();
        toast.success("App access removed");
      },
      onError: () => toast.error("Could not remove app access"),
    }),
  );

  const rows = useMemo(() => {
    const direct = (access.data?.directUsers ?? []).map((row) => ({
      id: row.id,
      name: row.name ?? row.email ?? row.userId ?? "Organization member",
      detail: row.email ?? "Direct app access",
      kind: "Person",
    }));
    const teams = (access.data?.teams ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      detail: row.linkedToProject
        ? "Linked to this project"
        : "No longer linked to this project",
      kind: "Team",
    }));
    return [...direct, ...teams];
  }, [access.data]);

  const columns: DataTableColumnDef<(typeof rows)[number]>[] = [
    {
      accessorKey: "name",
      header: "Person or team",
      cell: ({ row }) => (
        <div className="min-w-0">
          <span className="block truncate font-medium">
            {row.original.name}
          </span>
          <span className="block truncate text-muted-foreground text-xs">
            {row.original.detail}
          </span>
        </div>
      ),
    },
    { accessorKey: "kind", header: "Access source" },
    {
      id: "actions",
      meta: { role: "actions" },
      header: () => <DataTableActionsColumnHeader />,
      cell: ({ row }) => (
        <DataTableRowActions
          label={`Actions for ${row.original.name}`}
          actions={[
            {
              label: "Remove app access",
              destructive: true,
              disabled: revoke.isPending,
              onSelect: () =>
                revoke.mutate({ projectId, appId, accessId: row.original.id }),
            },
          ]}
        />
      ),
    },
  ];
  const effectiveColumns: DataTableColumnDef<
    NonNullable<typeof access.data>["effectivePeople"][number]
  >[] = [
    {
      accessorKey: "name",
      header: "Project member",
      cell: ({ row }) => (
        <div className="min-w-0">
          <span className="block truncate font-medium">
            {row.original.name ?? row.original.email ?? row.original.userId}
          </span>
          <span className="block truncate text-muted-foreground text-xs">
            {row.original.role ?? "Organization member"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "projectSources",
      header: "Project access through",
      cell: ({ row }) => row.original.projectSources.join(", "),
    },
    {
      accessorKey: "appSources",
      header: "App access through",
      cell: ({ row }) =>
        !row.original.projectCanReadApp
          ? "Project permissions don't include app access"
          : row.original.canAccess
            ? row.original.appSources.join(", ")
            : "No app assignment",
    },
  ];

  if (access.isPending || projectAccess.isPending) {
    return <AccordionSectionSkeleton rows={3} />;
  }
  if (access.isError || projectAccess.isError || !access.data) {
    return (
      <AccordionSection
        title="App access"
        description="Manage who can use this app."
      >
        <ErrorState
          title="Could not load app access"
          description="Try loading this section again."
          onRetry={() => {
            void access.refetch();
            void projectAccess.refetch();
          }}
        />
      </AccordionSection>
    );
  }

  const current = access.data;
  const directIds = new Set(current.directUsers.map((row) => row.userId));
  const teamIds = new Set(current.teams.map((row) => row.teamId));
  const readAction = appId === "tasks" ? "tasks.task.read" : "environment.read";
  const people = (projectAccess.data?.accessPeople ?? []).filter((person) =>
    person.effectiveActions.includes(readAction),
  );
  const linkedTeams = projectAccess.data?.teams ?? [];
  const availablePeople = people.filter(
    (person) => !directIds.has(person.userId),
  );
  const availableTeams = linkedTeams.filter(
    (team) => !teamIds.has(team.teamId),
  );

  return (
    <AccordionSection
      title="App access"
      description="Choose who can use this app within the access they already have to this project."
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={current.accessMode === "inherited" ? "default" : "outline"}
            disabled={setMode.isPending || current.accessMode === "inherited"}
            onClick={() =>
              setMode.mutate({ projectId, appId, mode: "inherited" })
            }
          >
            Inherit project access
          </Button>
          <Button
            size="sm"
            variant={
              current.accessMode === "restricted" ? "default" : "outline"
            }
            disabled={setMode.isPending || current.accessMode === "restricted"}
            onClick={() => setConfirmRestricted(true)}
          >
            Restrict to selected people and teams
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          {current.accessMode === "inherited"
            ? "Everyone with project access can use this app. Selected grants take effect when you restrict access."
            : "Only selected people and linked teams with project access can use this app. Project owners and managers retain access."}
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center gap-2">
            <SearchableCombobox
              value={userId}
              onChange={setUserId}
              ariaLabel={`Add a person to ${appName}`}
              placeholder="Select project member"
              searchPlaceholder="Search project members…"
              className="min-w-0 flex-1"
              options={availablePeople.map((person) => ({
                value: person.userId,
                label: person.name ?? person.email ?? person.userId,
                hint: person.email ?? undefined,
              }))}
            />
            <LoadingButton
              size="sm"
              disabled={!userId || grant.isPending}
              loading={grant.isPending}
              onClick={() => grant.mutate({ projectId, appId, userId })}
            >
              Add person
            </LoadingButton>
          </div>
          <div className="flex items-center gap-2">
            <SearchableCombobox
              value={teamId}
              onChange={setTeamId}
              ariaLabel={`Add a team to ${appName}`}
              placeholder="Select linked team"
              searchPlaceholder="Search linked teams…"
              className="min-w-0 flex-1"
              options={availableTeams.map((team) => ({
                value: team.teamId,
                label: team.teamName,
              }))}
            />
            <LoadingButton
              size="sm"
              disabled={!teamId || grant.isPending}
              loading={grant.isPending}
              onClick={() => grant.mutate({ projectId, appId, teamId })}
            >
              Add team
            </LoadingButton>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={rows}
          searchable
          enablePagination
          pageSize={10}
          framed
          compactLayout
          caption={`${appName} access assignments`}
          empty={{
            empty: {
              title: "No app-specific assignments",
              description:
                "Project access is inherited unless you restrict this app.",
            },
          }}
        />
        <section className="space-y-2">
          <div>
            <h3 className="font-medium text-sm">Effective project members</h3>
            <p className="text-muted-foreground text-xs">
              App access is always limited to people who already have access to
              this project.
            </p>
          </div>
          <DataTable
            columns={effectiveColumns}
            data={current.effectivePeople}
            searchable
            enablePagination
            pageSize={10}
            framed
            compactLayout
            caption={`${appName} effective access`}
            empty={{
              empty: {
                title: "No members currently have project access",
                description:
                  "Assign project access before granting app access.",
              },
            }}
          />
        </section>
      </div>
      <ConfirmDialog
        open={confirmRestricted}
        onOpenChange={setConfirmRestricted}
        title={`Restrict ${appName} access?`}
        description="People without a direct assignment or access through a linked team will lose access to this app. Project owners and managers retain access."
        confirmLabel="Restrict access"
        onConfirm={async () => {
          await setMode.mutateAsync({ projectId, appId, mode: "restricted" });
        }}
        isPending={setMode.isPending}
      />
    </AccordionSection>
  );
}
