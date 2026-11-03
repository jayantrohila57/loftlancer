"use client";

import { Button } from "@loftlancer/ui/button";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/patterns/error-state";
import { useOrgQueryEnabled } from "@/hooks/use-org-query-enabled";
import type { studioORPC } from "@/lib/orpc";
import { useCan } from "@/shared/permissions/shared.permissions.use.permissions";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";
import { useOrganizationBySlug } from "../hooks/client.use-organization-by-slug.hook";
import { OrganizationOverviewSkeleton } from "../skeletons/client.organization-skeleton";

type OrganizationResponse = Awaited<
  ReturnType<typeof studioORPC.organizations.getBySlug>
>;

export function OrganizationOverviewContent({
  slug,
  initialResponse,
  personal,
}: {
  slug: string;
  initialResponse: OrganizationResponse;
  personal: boolean;
}) {
  const organizationQuery = useOrganizationBySlug(slug, initialResponse);
  const enabled = useOrgQueryEnabled();
  const canViewProjects = useCan("organization.list");
  const projectsQuery = useQuery({
    ...trpc.projects.list.queryOptions(),
    enabled: enabled && canViewProjects.allowed,
  });
  const response = organizationQuery.data;
  if (response?.status === "failed") notFound();
  if (organizationQuery.isError)
    return (
      <ErrorState
        title="Organization unavailable"
        description="Could not load this organization."
        onRetry={() => void organizationQuery.refetch()}
      />
    );
  if (organizationQuery.isPending || canViewProjects.isLoading)
    return <OrganizationOverviewSkeleton />;
  if (
    response?.status !== "success" ||
    !response.data ||
    Array.isArray(response.data)
  ) {
    return (
      <ErrorState
        title="Organization unavailable"
        description="Could not load this organization."
        onRetry={() => void organizationQuery.refetch()}
      />
    );
  }

  const projects = projectsQuery.data?.data ?? [];
  const recentProjects = [...projects]
    .filter((project) => !project.isArchived)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5);
  const profile = response.data;

  return (
    <section className="min-w-0 space-y-4">
      <header>
        <h2 className="font-semibold text-xl tracking-tight">Overview</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          {personal
            ? "Personal organization overview and settings."
            : "Organization overview and settings."}
        </p>
      </header>
      <AccordionSection
        title="Organization details"
        description="A brief profile to help people recognize this organization."
      >
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
      </AccordionSection>
      {canViewProjects.allowed ? (
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
          {projectsQuery.isPending ? (
            <OrganizationOverviewSkeleton />
          ) : projectsQuery.isError ? (
            <ErrorState
              title="Projects unavailable"
              description="Could not load this organization’s projects."
              onRetry={() => void projectsQuery.refetch()}
            />
          ) : recentProjects.length ? (
            <ul className="divide-y">
              {recentProjects.map((project) => (
                <li key={project.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={routes.project(slug, project.slug)}
                    className="font-medium text-sm hover:underline"
                  >
                    {project.name}
                  </Link>
                  <p className="mt-1 text-muted-foreground text-xs">
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No projects yet.</p>
          )}
        </AccordionSection>
      ) : null}
    </section>
  );
}
