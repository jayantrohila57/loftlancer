"use client";

import { SettingsFrame } from "@loftlancer/ui/patterns/settings-frame";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { notFound, usePathname } from "next/navigation";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { ErrorState } from "@/components/patterns/error-state";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";
import { teamDisplayName } from "../lib/team-display-name";

export function TeamLayoutShell({
  slug,
  teamId,
  children,
}: {
  slug: string;
  teamId: string;
  children: React.ReactNode;
}) {
  const teamsQuery = useQuery(trpc.teams.get.queryOptions({ teamId }));
  const team = teamsQuery.data?.team;
  const { orgs } = useActiveOrganization();
  const organizationName = orgs.find((org) => org.slug === slug)?.name;
  const canListInvitations = useCan("member.list");
  const pathname = usePathname() ?? "";
  const root = routes.team(slug, teamId);
  if (teamsQuery.isPending) return <Skeleton className="h-64 rounded-md" />;
  if (teamsQuery.isError) {
    return (
      <ErrorState
        title="Could not load team"
        description="Try loading the team again."
        onRetry={() => void teamsQuery.refetch()}
      />
    );
  }
  if (!team) notFound();

  return (
    <SettingsFrame
      LinkComponent={Link as never}
      title={teamDisplayName(team.name, organizationName)}
      back={false}
      description={
        pathname === root
          ? team.purpose ||
            team.description ||
            "Team members and project access."
          : undefined
      }
      tabs={[
        { href: root, label: "Overview", active: pathname === root },
        {
          href: routes.teamSection(slug, teamId, "members"),
          label: "Members",
          active: pathname.endsWith("/members"),
        },
        {
          href: routes.teamSection(slug, teamId, "projects"),
          label: "Projects",
          active: pathname.endsWith("/projects"),
        },
        ...(canListInvitations.allowed
          ? [
              {
                href: routes.teamSection(slug, teamId, "invitations"),
                label: "Invitations",
                active: pathname.endsWith("/invitations"),
              },
            ]
          : []),
        {
          href: routes.teamSection(slug, teamId, "settings"),
          label: "Team settings",
          active: pathname.endsWith("/settings"),
        },
      ]}
    >
      {children}
    </SettingsFrame>
  );
}
