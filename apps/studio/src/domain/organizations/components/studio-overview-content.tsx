"use client";

import type { StudioRouter } from "@loftlancer/api/routers/studio";
import type { ProjectOutput } from "@loftlancer/api/types";
import { Button } from "@loftlancer/ui/button";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { AccordionSectionSkeleton } from "@loftlancer/ui/patterns/accordion-section-skeleton";
import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import { useQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { Route } from "next";
import Link from "next/link";
import { useMemo } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { useOrganizationFavorites } from "@/components/org/use-organization-favorites";
import { AppIcon } from "@/components/patterns/app-icon";
import { ErrorState } from "@/components/patterns/error-state";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { useOrgQueryEnabled } from "@/hooks/use-org-query-enabled";
import { formatDateTime } from "@/lib/format";
import { appIcons } from "@/lib/icons";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";
import { OrganizationCard } from "./organization-card";

type InvitationItem =
  inferRouterOutputs<StudioRouter>["organizations"]["listMyInvitations"]["items"][number];

function SectionSkeleton() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-busy="true">
      <AccordionSectionSkeleton rows={2} />
      <AccordionSectionSkeleton rows={3} />
      <AccordionSectionSkeleton rows={2} />
    </div>
  );
}

export function StudioOverviewContent() {
  const {
    orgs,
    activeOrganizationId,
    loading: organizationsLoading,
  } = useActiveOrganization();
  const { favorites, toggleFavorite, favoriteLimit } =
    useOrganizationFavorites();
  const queryEnabled = useOrgQueryEnabled();
  const activeOrg = orgs.find((org) => org.id === activeOrganizationId) ?? null;
  const { allowed: canViewDashboard, isLoading: permissionLoading } = useCan(
    "organization.hub.view",
  );

  const projectsQuery = useQuery({
    ...trpc.projects.list.queryOptions(),
    enabled: queryEnabled && Boolean(activeOrganizationId),
  });
  const invitationsQuery = useQuery(
    trpc.organizations.listMyInvitations.queryOptions(),
  );
  const dashboardQuery = useQuery({
    ...trpc.dashboard.getOverview.queryOptions(),
    enabled: queryEnabled && canViewDashboard,
  });

  const favoriteOrganizations = useMemo(() => {
    const byId = new Map(orgs.map((org) => [org.id, org]));
    return favorites
      .map((id) => byId.get(id))
      .filter((org): org is (typeof orgs)[number] => Boolean(org))
      .slice(0, favoriteLimit);
  }, [favorites, favoriteLimit, orgs]);

  const recentProjects = useMemo(
    () =>
      [...(projectsQuery.data?.data ?? [])]
        .filter((project: ProjectOutput) => !project.isArchived)
        .sort(
          (a: ProjectOutput, b: ProjectOutput) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 5),
    [projectsQuery.data?.data],
  );

  if (organizationsLoading || permissionLoading) return <SectionSkeleton />;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {orgs.length === 0 ? (
        <AccordionSection
          title="Your organizations"
          description="Create an organization to manage projects, people, and access."
        >
          <EmptyState
            icon={appIcons.organization}
            title="No organizations yet"
            description="Create an organization to bring your projects and teammates together."
            actionLabel="Create organization"
            actionHref={routes.newOrganization()}
          />
        </AccordionSection>
      ) : (
        <AccordionSection
          title="Favorite organizations"
          description="Your pinned organizations for quick access."
          actions={
            <Button
              size="sm"
              variant="outline"
              render={<Link href={routes.organizationsDirectory()} />}
            >
              All organizations
            </Button>
          }
        >
          {favoriteOrganizations.length > 0 ? (
            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {favoriteOrganizations.map((org) => (
                <OrganizationCard
                  key={org.id}
                  org={org}
                  isActive={org.id === activeOrganizationId}
                  isFavorite
                  onToggleFavorite={() => toggleFavorite(org.id)}
                  favoriteLimitReached={favorites.length >= favoriteLimit}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={appIcons.organization}
              title="No favorite organizations"
              description="Star an organization from the directory to keep it here."
              actionLabel="Open organizations"
              actionHref={routes.organizationsDirectory()}
            />
          )}
        </AccordionSection>
      )}

      <AccordionSection
        title="Recent projects"
        description={
          activeOrg
            ? `Recently updated in ${activeOrg.name}.`
            : "Recently updated projects."
        }
        actions={
          activeOrg ? (
            <Button
              size="sm"
              variant="outline"
              render={<Link href={routes.projects(activeOrg.slug)} />}
            >
              All projects
            </Button>
          ) : null
        }
      >
        {projectsQuery.isError ? (
          <ErrorState
            title="Projects unavailable"
            description="Could not load your recent projects."
            onRetry={() => void projectsQuery.refetch()}
          />
        ) : projectsQuery.isPending && activeOrganizationId ? (
          <AccordionSectionSkeleton rows={3} />
        ) : recentProjects.length > 0 && activeOrg ? (
          <div className="flex flex-col divide-y">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                href={routes.project(activeOrg.slug, project.slug)}
                className="flex min-w-0 items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:text-primary"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <AppIcon
                    name="project"
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                  <span className="truncate font-medium text-sm">
                    {project.name}
                  </span>
                </span>
                <span className="shrink-0 text-muted-foreground text-xs">
                  Updated {formatDateTime(project.updatedAt)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={appIcons.project}
            title="No projects yet"
            description={
              activeOrg
                ? "Projects in your current organization will appear here."
                : "Select an organization to see its projects."
            }
            actionLabel={activeOrg ? "Open projects" : "Open organizations"}
            actionHref={
              activeOrg
                ? routes.projects(activeOrg.slug)
                : routes.organizationsDirectory()
            }
          />
        )}
      </AccordionSection>

      <AccordionSection
        title="Pending invitations"
        description="Invitations sent to your verified email address."
        actions={
          <Button
            size="sm"
            variant="outline"
            render={
              <Link
                href={
                  `${routes.organizations()}?directory=1&tab=invites` as Route
                }
              />
            }
          >
            All invitations
          </Button>
        }
      >
        {invitationsQuery.isError ? (
          <ErrorState
            title="Invitations unavailable"
            description="Could not load your pending invitations."
            onRetry={() => void invitationsQuery.refetch()}
          />
        ) : invitationsQuery.isPending ? (
          <AccordionSectionSkeleton rows={2} />
        ) : invitationsQuery.data.items.length > 0 ? (
          <div className="flex flex-col divide-y">
            {invitationsQuery.data.items
              .slice(0, 5)
              .map((invitation: InvitationItem) => (
                <div
                  key={invitation.id}
                  className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <AppIcon
                      name="invite"
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm">
                        {invitation.organizationName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {invitation.role} · Expires{" "}
                        {formatDateTime(invitation.expiresAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href={routes.invitation(invitation.id)} />}
                  >
                    Review
                  </Button>
                </div>
              ))}
          </div>
        ) : (
          <EmptyState
            icon={appIcons.invite}
            title="No pending invitations"
            description="Invitations sent to your verified email will appear here."
          />
        )}
      </AccordionSection>

      {canViewDashboard && queryEnabled ? (
        <AccordionSection
          title="Your recent activity"
          description="Recent changes you made in the current organization."
          defaultOpen={false}
          actions={
            <Button
              size="sm"
              variant="outline"
              render={<Link href={routes.activity()} />}
            >
              Activity
            </Button>
          }
        >
          {dashboardQuery.isError ? (
            <ErrorState
              title="Activity unavailable"
              description="Could not load your recent activity."
              onRetry={() => void dashboardQuery.refetch()}
            />
          ) : dashboardQuery.isPending ? (
            <AccordionSectionSkeleton rows={3} />
          ) : dashboardQuery.data.activity.recentAuditLogs.length > 0 ? (
            <div className="flex flex-col divide-y">
              {dashboardQuery.data.activity.recentAuditLogs
                .slice(0, 5)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex min-w-0 items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="truncate text-sm">
                      {item.action} {item.entityType.toLowerCase()}
                      {item.entitySlug ? ` · ${item.entitySlug}` : ""}
                    </span>
                    <span className="shrink-0 text-muted-foreground text-xs">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState
              icon={appIcons.activity}
              title="No recent activity"
              description="Changes you make in this organization will appear here."
            />
          )}
        </AccordionSection>
      ) : null}
    </div>
  );
}
