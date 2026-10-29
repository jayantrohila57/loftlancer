"use client";

import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { AccordionSectionSkeleton } from "@loftlancer/ui/patterns/accordion-section-skeleton";
import {
  LOCAL_DATE_TIME_FORMAT,
  LocalDateTime,
} from "@loftlancer/ui/patterns/local-date-time";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ErrorState } from "@/components/patterns/error-state";
import { trpc } from "@/utils/trpc";

export function TeamOverviewContent({
  teamId,
  children,
}: {
  teamId: string;
  children: ReactNode;
}) {
  const query = useQuery(trpc.teams.get.queryOptions({ teamId }));
  if (query.isPending)
    return (
      <div className="space-y-2">
        <AccordionSectionSkeleton rows={2} />
        <AccordionSectionSkeleton rows={1} />
      </div>
    );
  if (query.isError)
    return (
      <ErrorState
        title="Could not load team details"
        description="Try loading the team again."
        onRetry={() => void query.refetch()}
      />
    );
  const team = query.data?.team;
  if (!team) return null;
  return (
    <section className="space-y-4">
      <AccordionSection
        title="Team profile"
        description="What this team does and who maintains it."
      >
        {team.description ||
        team.purpose ||
        team.createdAt ||
        team.updatedAt ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {team.purpose ? (
              <div>
                <p className="text-muted-foreground text-xs">Purpose</p>
                <p className="mt-1 text-sm">{team.purpose}</p>
              </div>
            ) : null}
            {team.description ? (
              <div>
                <p className="text-muted-foreground text-xs">Description</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {team.description}
                </p>
              </div>
            ) : null}
            {team.createdAt ? (
              <p className="text-muted-foreground text-xs">
                Created{" "}
                <LocalDateTime
                  value={String(team.createdAt)}
                  options={LOCAL_DATE_TIME_FORMAT}
                />
                {team.createdByName ? ` by ${team.createdByName}` : ""}
              </p>
            ) : null}
            {team.updatedAt ? (
              <p className="text-muted-foreground text-xs">
                Last updated{" "}
                <LocalDateTime
                  value={String(team.updatedAt)}
                  options={LOCAL_DATE_TIME_FORMAT}
                />
                {team.updatedByName ? ` by ${team.updatedByName}` : ""}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Add a purpose and description in Team settings.
          </p>
        )}
      </AccordionSection>
      {children}
    </section>
  );
}
