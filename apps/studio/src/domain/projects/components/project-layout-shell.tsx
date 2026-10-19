"use client";

import { SettingsFrame } from "@loftlancer/ui/patterns/settings-frame";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  StatusBadge,
  VisibilityBadge,
} from "@/components/patterns/status-badge";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";
import { useOrgSlug } from "@/utils/use-route-scope";
import { useProjectTabs } from "../hooks/use-project-tabs";
import { ProjectActions } from "./project-actions";
import { ProjectMetadataRow } from "./project-metadata-row";

function ProjectHeaderBadges({
  isPublic,
  isArchived,
  status,
}: {
  isPublic: boolean;
  isArchived: boolean;
  status: "active" | "inactive" | "maintenance";
}) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <VisibilityBadge isPublic={isPublic} />
      {isArchived ? <StatusBadge status="archived" /> : null}
      {!isArchived ? <StatusBadge status={status} /> : null}
    </span>
  );
}

/** Project identity and project navigation persist while route panels change. */
export function ProjectLayoutShell({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const org = useOrgSlug();
  const { data } = useQuery(trpc.projects.getBySlug.queryOptions({ slug }));
  const project = data?.data?.project;
  const { tabs, activeTab } = useProjectTabs(slug);

  return (
    <SettingsFrame
      LinkComponent={Link as never}
      back={{ href: routes.projects(org), label: "Projects" }}
      title={project?.name ?? slug}
      description={
        project?.description ?? "Project workspace and applications."
      }
      actions={project ? <ProjectActions project={project} /> : null}
      meta={
        project ? (
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="truncate font-medium text-foreground">{org}</span>
            <ProjectHeaderBadges
              isPublic={project.isPublic}
              isArchived={project.isArchived}
              status={project.status}
            />
            <ProjectMetadataRow project={project} />
          </div>
        ) : (
          <span className="truncate font-medium text-foreground">{org}</span>
        )
      }
      tabs={tabs.map((tab) => ({
        href: tab.href ?? `#loading-${tab.value}`,
        label: tab.label,
        active: tab.value === activeTab,
        disabled: tab.disabled,
      }))}
    >
      {children}
    </SettingsFrame>
  );
}
