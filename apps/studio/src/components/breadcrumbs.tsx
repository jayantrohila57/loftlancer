"use client";

import { BreadcrumbTrail } from "@loftlancer/ui/patterns/breadcrumb-trail";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { useProjects } from "@/domain/projects/hooks/use-projects";
import {
  type BreadcrumbCrumb,
  generateBreadcrumbs,
  resolveBreadcrumbLabel,
} from "@/lib/breadcrumbs";
import { useRouteNotFoundDepth } from "@/lib/route-not-found-store";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname() ?? "/";
  // On a 404 keep only the real ancestors (org / project) and end with
  // "Not found"; never title-case an unknown slug as if it existed (#317).
  const notFoundDepth = useRouteNotFoundDepth(pathname);
  const trail = generateBreadcrumbs(pathname);
  const breadcrumbs: BreadcrumbCrumb[] =
    notFoundDepth === null
      ? trail
      : [
          ...trail.slice(0, notFoundDepth),
          { href: pathname, segment: "", kind: "notFound" },
        ];
  const { orgs } = useActiveOrganization();
  const { projects } = useProjects();

  const orgSlug = breadcrumbs.find((c) => c.kind === "org")?.segment;
  const projectSlug = breadcrumbs.find((c) => c.kind === "project")?.segment;
  const teamId = breadcrumbs.find((c) => c.kind === "team")?.segment;
  const orgName = orgs.find((o) => o.slug === orgSlug)?.name;
  const projectName = projects.find((p) => p.slug === projectSlug)?.name;
  const teamQuery = useQuery({
    ...trpc.teams.get.queryOptions({ teamId: teamId ?? "" }),
    enabled: Boolean(teamId),
    staleTime: 60_000,
  });
  const teamName = teamQuery.data?.team?.name;

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

  const breadcrumbLabel = (crumb: (typeof breadcrumbs)[number]) =>
    resolveBreadcrumbLabel(crumb, {
      organizationName: orgName,
      projectName: projectName,
      teamName,
      supportTicketLabel,
    });

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
