import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TimelinePageClient } from "@/domain/timeline/components/timeline-page-client";
import { isActionsAuditEnabledOnServer } from "@/lib/actions-audit-enabled";
import { guardPageAction, guardProjectSlugPage } from "@/lib/page-guards";
import { ProjectSection } from "@/module/projects/projects.section";

export const metadata: Metadata = {
  title: "Activity",
  description: "Audit events for this project.",
};

export default async function ProjectActivityRoute({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  if (!isActionsAuditEnabledOnServer()) notFound();
  const { project: slug } = await params;
  const { project } = await guardProjectSlugPage(slug);
  await guardPageAction("audit.timeline.view.project", {
    organizationId: project.organizationId,
    projectId: project.id,
  });
  return (
    <ProjectSection
      title="Activity"
      description="Audit events for this project."
    >
      <TimelinePageClient scope="project" projectId={project.id} />
    </ProjectSection>
  );
}
