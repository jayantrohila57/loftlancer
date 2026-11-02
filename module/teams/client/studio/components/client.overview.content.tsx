"use client";

import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";

import {
  LOCAL_DATE_TIME_FORMAT,
  LocalDateTime,
} from "@loftlancer/ui/patterns/local-date-time";

import type { ReactNode } from "react";

import type { TeamDto } from "../../../utils/types/utils.team.dto";

export function TeamOverviewContent({
  team,
  children,
}: {
  team: TeamDto;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
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
