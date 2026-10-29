import { isSoftDeletesEnabled } from "@loftlancer/env/soft-deletes";
import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { guardPageAction } from "@/lib/page-guards";
import { siteConfig } from "@/lib/siteConfig";
import { ProjectsPageClient } from "@/module/projects/projects.projects.page.client";
import { ProjectsPageSkeleton } from "@/module/projects/projects.skeletons";

export const metadata: Metadata = {
  title: "Projects",
  description: `Manage your projects and environment variables in ${siteConfig.name}.`,
};

export default async function ProjectsPage() {
  await guardPageAction("project.read");
  return (
    <Suspense
      fallback={<DelayedPageLoading fallback={<ProjectsPageSkeleton />} />}
    >
      <ProjectsPageClient showDeletedProjects={isSoftDeletesEnabled()} />
    </Suspense>
  );
}
