"use client";

import { SettingsFrame } from "@loftlancer/ui/patterns/settings-frame";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
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
  const suffix = pathname.slice(projectHref.length).split("/").filter(Boolean);
  const isProjectOverview = suffix.length === 0;

  return (
    <SettingsFrame
      LinkComponent={Link as never}
      back={false}
      title={project?.name ?? slug}
      description={
        project?.description ?? "Project workspace and applications."
      }
      tabs={[
        { href: projectHref, label: "Overview", active: isProjectOverview },
        {
          href: routes.projectSection(org, slug, "apps"),
          label: "Apps",
          active:
            suffix[0] === "apps" ||
            suffix[0] === "tasks" ||
            suffix[0] === "env" ||
            (Boolean(suffix[0]) &&
              !["access", "invitations", "activity", "settings"].includes(
                suffix[0] ?? "",
              )),
        },
        {
          href: routes.projectSection(org, slug, "access"),
          label: "Access",
          active: suffix[0] === "access",
        },
        ...(canListMembers.allowed
          ? [
              {
                href: routes.projectSection(org, slug, "invitations"),
                label: "Invitations",
                active: suffix[0] === "invitations",
              },
            ]
          : []),
        ...(isActionsAuditEnabledOnClient() && canViewActivity.allowed
          ? [
              {
                href: routes.projectSection(org, slug, "activity"),
                label: "Activity",
                active: suffix[0] === "activity",
              },
            ]
          : []),
        {
          href: routes.projectSection(org, slug, "settings"),
          label: "Project settings",
          active: suffix[0] === "settings",
        },
      ]}
    >
      {children}
    </SettingsFrame>
  );
}
