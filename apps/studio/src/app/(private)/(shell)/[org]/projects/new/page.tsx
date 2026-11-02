import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { guardPageAction } from "@/lib/page-guards";
import { ProjectsPageClient } from "@/module/projects/projects.projects.page.client";
import { ProjectsPageSkeleton } from "@/module/projects/projects.skeletons";

export const metadata: Metadata = { title: "New project" };

/** /[org]/projects/new — the project list with the create sheet open. */
export default async function NewProjectPage() {
  await guardPageAction("project.create");
  return (
    <Suspense
      fallback={<DelayedPageLoading fallback={<ProjectsPageSkeleton />} />}
    >
      <ProjectsPageClient createRoute />
    </Suspense>
  );
}
