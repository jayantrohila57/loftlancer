"use client";

import type { ProjectOutput } from "@loftlancer/api/types";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/patterns/error-state";
import { InstalledAppsOverview } from "@/domain/apps/components/installed-apps-overview";
import { useOrgQueryEnabled } from "@/hooks/use-org-query-enabled";
import { useOrgScopedQueryPlaceholder } from "@/hooks/use-org-scoped-query-placeholder";
import { projectDetailQueryStaleTime } from "@/lib/prefetch-project-detail";
import { trpc } from "@/utils/trpc";

function formatCountLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatEnvironmentsSectionSummary(
  environmentCount: number,
  variableCount: number,
) {
  return `${formatCountLabel(environmentCount, "environment", "environments")} · ${formatCountLabel(variableCount, "variable", "variables")}`;
}

export function ProjectOverviewSectionsSkeleton() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-busy="true">
      <Skeleton className="h-4 w-10" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
      </div>
    </div>
  );
}

export function ProjectOverviewSections({
  slug,
  project,
}: {
  slug: string;
  project: ProjectOutput;
}) {
  const queryEnabled = useOrgQueryEnabled();
  const { data, isPending, isError } = useQuery({
    ...trpc.dashboard.getProjectDetailStats.queryOptions({ slug }),
    enabled: queryEnabled && Boolean(slug),
    staleTime: projectDetailQueryStaleTime,
    gcTime: projectDetailQueryStaleTime * 2,
  });

  const showPlaceholder = useOrgScopedQueryPlaceholder(
    queryEnabled,
    data,
    isPending,
  );

  if (showPlaceholder) {
    return <ProjectOverviewSectionsSkeleton />;
  }

  const environmentCount = data?.environmentCount ?? 0;
  const variableCount = data?.variableCount ?? 0;
  const summary = isError
    ? "—"
    : formatEnvironmentsSectionSummary(environmentCount, variableCount);

  return (
    <div className="flex flex-col gap-6">
      <InstalledAppsOverview slug={slug} summaries={{ env: summary }} />
      <ProjectAccessOverview project={project} />
    </div>
  );
}

function ProjectAccessOverview({ project }: { project: ProjectOutput }) {
  const summary = useQuery(
    trpc.projectAccess.getSummary.queryOptions({ projectId: project.id }),
  );

  return (
    <section className="rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-medium text-sm">Project access</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            {project.isPublic
              ? "Project metadata is public. Data access still follows project permissions."
              : "Project data is limited by organization and project permissions."}
          </p>
        </div>
      </div>
      {summary.isPending ? (
        <div
          className="mt-4 grid gap-3 sm:grid-cols-3"
          role="status"
          aria-label="Loading project access"
        >
          <Skeleton className="h-12 rounded-md" />
          <Skeleton className="h-12 rounded-md" />
          <Skeleton className="h-12 rounded-md" />
        </div>
      ) : summary.isError ? (
        <div className="mt-4">
          <ErrorState
            title="Could not load access details"
            description="Try loading the project access summary again."
            onRetry={() => void summary.refetch()}
          />
        </div>
      ) : (
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-muted/40 p-3">
            <dt className="text-muted-foreground text-xs">Project managers</dt>
            <dd className="mt-1 font-medium text-sm">
              {summary.data.managers.length}
            </dd>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <dt className="text-muted-foreground text-xs">Linked teams</dt>
            <dd className="mt-1 font-medium text-sm">
              {summary.data.teams.length}
            </dd>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <dt className="text-muted-foreground text-xs">
              Direct member grants
            </dt>
            <dd className="mt-1 font-medium text-sm">
              {summary.data.memberGrants.length}
            </dd>
          </div>
        </dl>
      )}
    </section>
  );
}
