"use client";

import type { ProjectOutput } from "@loftlancer/api/types";
import { Button } from "@loftlancer/ui/button";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { AccordionSectionSkeleton } from "@loftlancer/ui/patterns/accordion-section-skeleton";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ErrorState } from "@/components/patterns/error-state";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { orgHubSectionActions } from "@/domain/permissions/org-section-actions";
import { ProjectsTableView } from "@/domain/projects/components/projects-table-view";
import { useOrgQueryEnabled } from "@/hooks/use-org-query-enabled";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";

export function OrganizationOverviewSectionsSkeleton() {
  return <AccordionSectionSkeleton rows={3} />;
}

export function OrganizationOverviewSections({ slug }: { slug: string }) {
  const { organization, status } = useOrganizationBySlug(slug);
  const queryEnabled = useOrgQueryEnabled();
  const { allowed, isLoading: permissionLoading } = useCan(
    orgHubSectionActions.projects,
  );
  const projectsQuery = useQuery({
    ...trpc.projects.list.queryOptions(),
    enabled:
      queryEnabled &&
      status === "success" &&
      Boolean(organization?.id) &&
      allowed,
  });

  if (status === "loading" || permissionLoading) {
    return <OrganizationOverviewSectionsSkeleton />;
  }

  if (!allowed) return null;

  if (projectsQuery.isPending) return <OrganizationOverviewSectionsSkeleton />;

  if (projectsQuery.isError) {
    return (
      <ErrorState
        title="Projects unavailable"
        description="Could not load this workspace’s projects."
        onRetry={() => void projectsQuery.refetch()}
      />
    );
  }

  const recentProjects = [...(projectsQuery.data?.data ?? [])]
    .filter((project: ProjectOutput) => !project.isArchived)
    .sort(
      (a: ProjectOutput, b: ProjectOutput) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5);

  return (
    <AccordionSection
      title="Recent projects"
      description="Recently updated projects in this workspace."
      actions={
        <Button
          variant="outline"
          size="sm"
          render={<Link href={routes.projects(slug)} />}
        >
          View all
        </Button>
      }
    >
      <ProjectsTableView
        projects={recentProjects}
        isLoading={projectsQuery.isPending}
        searchable={false}
        limitRows={5}
        caption="Recently updated projects"
        captionSrOnly
      />
    </AccordionSection>
  );
}
