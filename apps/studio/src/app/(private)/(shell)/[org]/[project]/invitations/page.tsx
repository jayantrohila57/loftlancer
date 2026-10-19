import type { Metadata } from "next";
import { ProjectInvitationsPage } from "@/domain/projects/components/project-invitations-page";
import { guardPageAction, guardProjectSlugPage } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Project invitations",
  description: "Invite people to this project.",
};

export default async function ProjectInvitationsRoute({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const { project } = await params;
  const resolved = await guardProjectSlugPage(project);
  await guardPageAction("member.list", {
    organizationId: resolved.project.organizationId,
  });
  return <ProjectInvitationsPage slug={project} />;
}
