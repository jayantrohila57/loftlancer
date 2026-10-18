"use client";

import { SettingsFrame } from "@loftlancer/ui/patterns/settings-frame";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";
import { useOrgSlug } from "@/utils/use-route-scope";
import { useProjectTabs } from "../hooks/use-project-tabs";

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
      identity={org}
      subtitle={project?.slug ?? slug}
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
