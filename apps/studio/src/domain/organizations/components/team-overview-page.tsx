"use client";

import { Skeleton } from "@loftlancer/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

export function TeamOverviewPage({
  slug,
  teamId,
}: {
  slug: string;
  teamId: string;
}) {
  const members = useQuery(trpc.teams.members.queryOptions({ teamId }));
  const projects = useQuery(trpc.teams.projects.queryOptions({ teamId }));
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-semibold text-xl tracking-tight">Overview</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Linking a team to a project gives its members default project grants.
          Review each member's grants in project Access.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href={routes.teamSection(slug, teamId, "members")}
          className="rounded-xl border bg-card p-4 hover:bg-muted/40"
        >
          <span className="font-medium">Members</span>
          <span className="mt-1 block text-muted-foreground text-sm">
            {members.isPending ? (
              <Skeleton className="h-4 w-20" />
            ) : members.isError ? (
              "Unavailable"
            ) : (
              `${members.data.items.length} members`
            )}
          </span>
        </Link>
        <Link
          href={routes.teamSection(slug, teamId, "projects")}
          className="rounded-xl border bg-card p-4 hover:bg-muted/40"
        >
          <span className="font-medium">Linked projects</span>
          <span className="mt-1 block text-muted-foreground text-sm">
            {projects.isPending ? (
              <Skeleton className="h-4 w-20" />
            ) : projects.isError ? (
              "Unavailable"
            ) : (
              `${projects.data.items.length} visible projects`
            )}
          </span>
        </Link>
      </div>
    </section>
  );
}
