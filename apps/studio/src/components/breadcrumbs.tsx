"use client";

import { BreadcrumbTrail } from "@loftlancer/ui/patterns/breadcrumb-trail";
import { Skeleton } from "@loftlancer/ui/skeleton";
import {
  isReservedOrgSlug,
  isReservedProjectSlug,
} from "@loftlancer/ui/studio-routes";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import type React from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { useProjects } from "@/domain/projects/hooks/use-projects";
import { useRouteNotFoundDepth } from "@/lib/route-not-found-store";
import { deSlug } from "@/lib/utils";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

const STATIC_LABELS: Record<string, string> = {
  new: "New",
  activity: "Activity",
  onboarding: "Onboarding",
  members: "Members",
  teams: "Teams",
  invitations: "Invitations",
  roles: "Roles & access",
  settings: "Settings",
  profile: "Profile",
  sessions: "Sessions",
  accounts: "Connected accounts",
  export: "Export",
  delete: "Delete account",
  timeline: "Activity",
  projects: "Projects",
  notifications: "Notifications",
  env: "Environments",
  tasks: "Tasks",
  apps: "Apps",
  support: "Support",
  tickets: "Tickets",
  help: "Help",
};

type Crumb = { href: string; segment: string; kind: CrumbKind };
type CrumbKind =
  | "static"
  | "org"
  | "project"
  | "team"
  | "app"
  | "ticket"
  | "task"
  | "notFound";

/**
 * Crumbs follow the URL scope (#299): /[org]/[project]/[app]/…, with the
 * user-level pages (support, notifications, activity) under the root.
 */
function generateBreadcrumbs(pathname: string): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);
  const userLevel = parts[0] ? isReservedOrgSlug(parts[0]) : true;
  return parts.map((segment, index) => {
    const href = `/${parts.slice(0, index + 1).join("/")}`;
    let kind: CrumbKind = "static";
    if (userLevel) {
      if (
        parts[0] === "support" &&
        parts[1] === "tickets" &&
        index === 2 &&
        segment !== "new"
      )
        kind = "ticket";
    } else if (index === 0) kind = "org";
    else if (index === 1 && parts[1] === "teams") kind = "static";
    else if (index === 1 && !isReservedProjectSlug(segment)) kind = "project";
    else if (index === 2 && parts[1] === "teams") kind = "team";
    else if (
      index === 2 &&
      parts[1] &&
      !isReservedProjectSlug(parts[1]) &&
      !["apps", "access", "invitations", "activity", "settings"].includes(
        segment,
      )
    )
      kind = "app";
    else if (
      (index === 3 && parts[2] === "tasks") ||
      (index === 4 && parts[2] === "apps" && parts[3] === "tasks")
    ) {
      if (segment !== "settings") kind = "task";
    }
    return { href, segment, kind };
  });
}

function formatSegmentLabel(segment: string, resolvedName?: string) {
  if (resolvedName) return resolvedName;
  return STATIC_LABELS[segment] ?? deSlug(segment);
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname() ?? "/";
  // On a 404 keep only the real ancestors (org / project) and end with
  // "Not found"; never title-case an unknown slug as if it existed (#317).
  const notFoundDepth = useRouteNotFoundDepth(pathname);
  const trail = generateBreadcrumbs(pathname);
  const breadcrumbs: Crumb[] =
    notFoundDepth === null
      ? trail
      : [
          ...trail.slice(0, notFoundDepth),
          { href: pathname, segment: "", kind: "notFound" },
        ];
  const { orgs, initialLoadDone } = useActiveOrganization();
  const { projects, status: projectsStatus } = useProjects();

  const orgSlug = breadcrumbs.find((c) => c.kind === "org")?.segment;
  const projectSlug = breadcrumbs.find((c) => c.kind === "project")?.segment;
  const teamId = breadcrumbs.find((c) => c.kind === "team")?.segment;
  const orgName = orgs.find((o) => o.slug === orgSlug)?.name;
  const projectName = projects.find((p) => p.slug === projectSlug)?.name;
  const teamsQuery = useQuery({
    ...trpc.teams.list.queryOptions(),
    enabled: Boolean(teamId),
    staleTime: 60_000,
  });
  const teamName = teamsQuery.data?.items.find(
    (team) => team.id === teamId,
  )?.name;

  const supportTicketId = breadcrumbs.find((c) => c.kind === "ticket")?.segment;
  const supportTicketQuery = useQuery({
    ...trpc.support.getTicket.queryOptions({
      ticketId: supportTicketId ?? "",
    }),
    enabled: Boolean(supportTicketId),
    staleTime: 60_000,
  });
  const supportTicketLabel = supportTicketQuery.data?.ticket
    ? `#${supportTicketQuery.data.ticket.ticketNumber} ${supportTicketQuery.data.ticket.subject}`
    : supportTicketId
      ? "Ticket"
      : undefined;

  const breadcrumbLabel = (crumb: Crumb): React.ReactNode => {
    if (crumb.kind === "notFound") return "Not found";
    if (crumb.segment === "settings") {
      const segments = crumb.href.split("/").filter(Boolean);
      if (segments.includes("teams")) return "Team settings";
      if (
        segments.some((segment) => ["apps", "env", "tasks"].includes(segment))
      ) {
        return "App settings";
      }
      if (segments.length === 2) return "Organization settings";
      if (segments.length === 3) return "Project settings";
    }
    // Unresolved org/project names: a placeholder while loading, not the slug.
    if (crumb.kind === "org" && !orgName && !initialLoadDone) {
      return <Skeleton className="inline-block h-3 w-20 align-middle" />;
    }
    if (
      crumb.kind === "project" &&
      !projectName &&
      projectsStatus === "loading"
    ) {
      return <Skeleton className="inline-block h-3 w-20 align-middle" />;
    }
    return formatSegmentLabel(
      crumb.segment,
      crumb.kind === "org"
        ? orgName
        : crumb.kind === "project"
          ? projectName
          : crumb.kind === "team"
            ? teamName
            : crumb.kind === "ticket"
              ? supportTicketLabel
              : crumb.kind === "task"
                ? `Task #${crumb.segment}`
                : undefined,
    );
  };

  return (
    <BreadcrumbTrail
      homeHref={routes.home()}
      className={className}
      items={breadcrumbs.map((crumb) => ({
        href: crumb.href,
        label: breadcrumbLabel(crumb),
      }))}
    />
  );
}
