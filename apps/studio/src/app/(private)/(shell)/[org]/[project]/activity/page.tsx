import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TimelinePageClient } from "@/domain/timeline/components/timeline-page-client";
import { isActionsAuditEnabledOnServer } from "@/lib/actions-audit-enabled";
import { guardPageAction, guardProjectSlugPage } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Project activity",
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
    <section className="space-y-4">
      <div>
        <h2 className="font-semibold text-xl tracking-tight">
          Project activity
        </h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Audit events for this project.
        </p>
      </div>
      <TimelinePageClient scope="project" projectId={project.id} />
    </section>
  );
}
