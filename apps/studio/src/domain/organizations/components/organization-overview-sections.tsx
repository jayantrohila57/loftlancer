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
  const profileQuery = useQuery({
    ...trpc.organizations.getBySlug.queryOptions({ slug }),
    enabled: queryEnabled && status === "success" && Boolean(organization?.id),
  });

  if (status === "loading" || permissionLoading) {
    return <OrganizationOverviewSectionsSkeleton />;
  }

  if (!allowed) return null;

  if (projectsQuery.isPending || profileQuery.isPending)
    return <OrganizationOverviewSectionsSkeleton />;

  if (projectsQuery.isError) {
    return (
      <ErrorState
        title="Projects unavailable"
        description="Could not load this organization’s projects."
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
  const profile = profileQuery.data;

  return (
    <div className="flex flex-col gap-4">
      <AccordionSection
        title="Organization details"
        description="A brief profile to help people recognize this organization."
      >
        {profileQuery.isError ? (
          <ErrorState
            title="Organization details unavailable"
            description="Could not load this organization’s public profile."
            onRetry={() => void profileQuery.refetch()}
          />
        ) : profile ? (
          <div className="space-y-3 text-sm">
            {profile.description ? <p>{profile.description}</p> : null}
            <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {profile.industry ? (
                <div>
                  <dt className="text-muted-foreground">Industry</dt>
                  <dd>{profile.industry}</dd>
                </div>
              ) : null}
              {profile.sizeBand ? (
                <div>
                  <dt className="text-muted-foreground">Organization size</dt>
                  <dd>{profile.sizeBand} people</dd>
                </div>
              ) : null}
              {profile.websiteUrl ? (
                <div>
                  <dt className="text-muted-foreground">Website</dt>
                  <dd>
                    <a
                      className="text-primary underline underline-offset-4"
                      href={profile.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {profile.websiteUrl}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
            {!profile.description &&
            !profile.industry &&
            !profile.sizeBand &&
            !profile.websiteUrl ? (
              <p className="text-muted-foreground">
                No public details added yet.
              </p>
            ) : null}
          </div>
        ) : null}
      </AccordionSection>
      <AccordionSection
        title="Recent projects"
        description="Recently updated projects in this organization."
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
          showLinksColumn={recentProjects.some((project) =>
            Boolean(project.repositoryUrl || project.websiteUrl),
          )}
          isLoading={projectsQuery.isPending}
          searchable={false}
          limitRows={5}
          caption="Recently updated projects"
          captionSrOnly
        />
      </AccordionSection>
    </div>
  );
}
