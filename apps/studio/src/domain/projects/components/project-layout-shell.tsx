"use client";

import { SettingsFrame } from "@loftlancer/ui/patterns/settings-frame";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { getProjectTabs } from "@/domain/projects/lib/project-tabs";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";
import { useOrgSlug } from "@/utils/use-route-scope";

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
  const canListMembers = useCan("member.list");
  const canViewActivity = useCan("audit.timeline.view.project", {
    projectId: project?.id,
  });
  const pathname = usePathname() ?? projectHref;
  const isProjectOverview = pathname === projectHref;
  const tabs = getProjectTabs({
    org,
    project: slug,
    pathname,
    canListMembers: canListMembers.allowed,
    isCheckingMembers: canListMembers.isLoading,
    canViewActivity: canViewActivity.allowed,
    isCheckingActivity: canViewActivity.isLoading,
    activityEnabled: isActionsAuditEnabledOnClient(),
  });

  return (
    <SettingsFrame
      LinkComponent={Link as never}
      back={false}
      title={project?.name ?? slug}
      description={
        isProjectOverview
          ? (project?.description ?? "Project workspace and applications.")
          : undefined
      }
      tabs={tabs}
    >
      {children}
    </SettingsFrame>
  );
}
