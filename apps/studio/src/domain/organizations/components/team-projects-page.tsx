"use client";

import { Button } from "@loftlancer/ui/button";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
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

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-semibold text-xl tracking-tight">Projects</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Linking this team gives its members the default project read grants.
          Unlinking removes the team association. Existing member grants stay
          until you change them in project Access.
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
      {linked.isPending ? (
        <Skeleton className="h-24 rounded-xl" />
      ) : linked.isError ? (
        <ErrorState
          title="Could not load linked projects"
          description="Try loading the team projects again."
          onRetry={() => void linked.refetch()}
        />
      ) : linked.data.items.length === 0 ? (
        <p className="rounded-xl border bg-card p-4 text-muted-foreground text-sm">
          This team is not linked to any projects yet.
        </p>
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {linked.data.items.map((project) => (
            <li
              key={project.id}
              className="flex items-center justify-between gap-3 p-4"
            >
              <Link
                href={routes.project(slug, project.slug)}
                className="min-w-0 font-medium text-sm hover:underline"
              >
                {project.name}
              </Link>
              <Can action="project.assign_team" projectId={project.id}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={remove.isPending}
                  onClick={() =>
                    confirm({
                      title: `Unlink ${project.name}?`,
                      description:
                        "Team members will lose access granted through this team. Direct project grants and project manager access stay in place.",
                      confirmLabel: "Unlink project",
                      variant: "destructive",
                      onConfirm: async () => {
                        await remove.mutateAsync({
                          projectId: project.id,
                          teamId,
                        });
                      },
                    })
                  }
                >
                  Unlink
                </Button>
              </Can>
            </li>
          ))}
        </ul>
      )}
      {ConfirmDialog}
    </section>
  );
}
