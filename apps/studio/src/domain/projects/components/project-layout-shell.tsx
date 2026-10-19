"use client";

import { SettingsFrame } from "@loftlancer/ui/patterns/settings-frame";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  StatusBadge,
  VisibilityBadge,
} from "@/components/patterns/status-badge";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";
import { useOrgSlug } from "@/utils/use-route-scope";
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
  const projectHref = routes.project(org, slug);
  const pathname = usePathname() ?? projectHref;
  const suffix = pathname.slice(projectHref.length).split("/").filter(Boolean);
  const isProjectOverview = suffix.length === 0;
  let backHref = projectHref;
  let backLabel = "Project overview";
  if (isProjectOverview) {
    backHref = routes.projects(org);
    backLabel = "Projects";
  } else if (suffix[0] === "tasks") {
    backHref = routes.tasks(org, slug);
    backLabel = "Tasks";
  } else if (suffix[0] === "env") {
    backHref = routes.env(org, slug);
    backLabel = "Environments";
  } else if (suffix[0] === "apps") {
    backHref = projectHref;
    backLabel = "Project overview";
  } else if (suffix.length === 1) {
    backHref = routes.projectSection(org, slug, "apps");
    backLabel = "Apps";
  } else if (suffix.length === 2 && suffix[1] === "settings") {
    backHref = routes.app(org, slug, suffix[0] ?? "");
    backLabel = "App";
  }

  return (
    <SettingsFrame
      LinkComponent={Link as never}
      back={{
        href: backHref,
        label: backLabel,
      }}
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
      hideTabs
    >
      {children}
    </SettingsFrame>
  );
}
