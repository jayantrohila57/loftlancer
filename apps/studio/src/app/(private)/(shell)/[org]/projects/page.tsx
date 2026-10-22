import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectsPageClient } from "@/domain/projects/components/projects-page-client";
import { ProjectsPageSkeleton } from "@/domain/projects/components/skeletons";
import { guardPageAction } from "@/lib/page-guards";
import { siteConfig } from "@/lib/siteConfig";

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
      <ProjectsPageClient />
    </Suspense>
  );
}
