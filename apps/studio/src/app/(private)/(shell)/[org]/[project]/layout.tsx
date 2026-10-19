import { HydrationBoundary } from "@tanstack/react-query";
import { ProjectLayoutShell } from "@/domain/projects/components/project-layout-shell";
import { loadProjectPageDataOrNotFound } from "@/lib/page-guards";

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
