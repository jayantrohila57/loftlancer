"use client";

import { Skeleton } from "@loftlancer/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
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

export function ProjectOverviewSections({ slug }: { slug: string }) {
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

  return <InstalledAppsOverview slug={slug} summaries={{ env: summary }} />;
}
