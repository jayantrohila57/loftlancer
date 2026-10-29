"use client";

import { SettingsFrame } from "@loftlancer/ui/patterns/settings-frame";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import { getProjectTabs } from "@/module/projects/projects.project.tabs";
import { useCan } from "@/shared/permissions/shared.permissions.use.permissions";
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
          ? (project?.description ?? "Project resources and apps.")
          : undefined
      }
      tabs={tabs}
    >
      {children}
    </SettingsFrame>
  );
}
