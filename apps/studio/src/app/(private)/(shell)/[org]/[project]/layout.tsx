import { ProjectLayoutShell } from "@/domain/projects/components/project-layout-shell";
import { guardProjectSlugPage } from "@/lib/page-guards";

export default async function ProjectSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string; project: string }>;
}) {
  const { project: slug } = await params;
  await guardProjectSlugPage(slug);
  return <ProjectLayoutShell slug={slug}>{children}</ProjectLayoutShell>;
}
