import { HydrationBoundary } from "@tanstack/react-query";
import { loadProjectPageDataOrNotFound } from "@/lib/page-guards";
import { ProjectLayoutShell } from "@/module/projects/projects.project.layout.shell";

export default async function ProjectSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string; project: string }>;
}) {
  const { project: slug } = await params;
  const data = await loadProjectPageDataOrNotFound(slug);
  return (
    <HydrationBoundary state={data.dehydratedState}>
      <ProjectLayoutShell slug={slug}>{children}</ProjectLayoutShell>
    </HydrationBoundary>
  );
}
