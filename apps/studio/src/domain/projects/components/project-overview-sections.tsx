"use client";

import type { ProjectOutput } from "@loftlancer/api/types";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { AccordionSectionSkeleton } from "@loftlancer/ui/patterns/accordion-section-skeleton";
import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import { InstalledAppsOverview } from "@/domain/apps/components/installed-apps-overview";
import { appIcons } from "@/lib/icons";
import { routes } from "@/utils/navigation";

export function ProjectOverviewSectionsSkeleton() {
  return <AccordionSectionSkeleton rows={2} />;
}

export function ProjectOverviewSections({
  slug,
  orgSlug,
  project,
}: {
  slug: string;
  orgSlug: string;
  project: ProjectOutput;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <AccordionSection
        title="Project details"
        description="Purpose, schedule, and project documentation."
      >
        {project.description ||
        project.purpose ||
        project.documentationUrl ||
        project.startDate ||
        project.targetDate ? (
          <dl className="grid gap-4 sm:grid-cols-2">
            {project.description ? (
              <div>
                <dt className="text-muted-foreground text-xs">Description</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm">
                  {project.description}
                </dd>
              </div>
            ) : null}
            {project.purpose ? (
              <div>
                <dt className="text-muted-foreground text-xs">Purpose</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm">
                  {project.purpose}
                </dd>
              </div>
            ) : null}
            {project.startDate || project.targetDate ? (
              <div>
                <dt className="text-muted-foreground text-xs">Schedule</dt>
                <dd className="mt-1 text-sm">
                  {project.startDate || "Start date not set"} –{" "}
                  {project.targetDate || "No target date"}
                </dd>
              </div>
            ) : null}
            {project.documentationUrl ? (
              <div>
                <dt className="text-muted-foreground text-xs">Documentation</dt>
                <dd className="mt-1 text-sm">
                  <a
                    className="text-primary underline underline-offset-4"
                    href={project.documentationUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open project documentation
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <EmptyState
            icon={appIcons.project}
            title="No project details yet"
            description="Add a purpose, schedule, or documentation link in Settings."
            actionLabel="Edit project details"
            actionHref={routes.projectSection(orgSlug, slug, "settings")}
            bare
            className="min-h-0 items-start p-0 text-left"
          />
        )}
      </AccordionSection>
      <AccordionSection
        title="Installed apps"
        description="Applications connected to this project."
      >
        <InstalledAppsOverview slug={slug} />
      </AccordionSection>
    </div>
  );
}
