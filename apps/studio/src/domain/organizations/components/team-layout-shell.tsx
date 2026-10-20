"use client";

import { SettingsFrame } from "@loftlancer/ui/patterns/settings-frame";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { notFound, usePathname } from "next/navigation";
import { ErrorState } from "@/components/patterns/error-state";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

export function TeamLayoutShell({
  slug,
  teamId,
  children,
}: {
  slug: string;
  teamId: string;
  children: React.ReactNode;
}) {
  const teamsQuery = useQuery(trpc.teams.list.queryOptions());
  const team = teamsQuery.data?.items.find((item) => item.id === teamId);
  const pathname = usePathname() ?? "";
  const root = routes.team(slug, teamId);
  if (teamsQuery.isPending) return <Skeleton className="h-64 rounded-xl" />;
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
      back={{ href: routes.orgSection(slug, "teams"), label: "Teams" }}
      title={team.name}
      description="Team members and project access."
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
        {
          href: routes.teamSection(slug, teamId, "invitations"),
          label: "Invitations",
          active: pathname.endsWith("/invitations"),
        },
        {
          href: routes.teamSection(slug, teamId, "settings"),
          label: "Settings",
          active: pathname.endsWith("/settings"),
        },
      ]}
    >
      {children}
    </SettingsFrame>
  );
}
