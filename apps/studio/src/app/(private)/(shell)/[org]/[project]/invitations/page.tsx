import type { Metadata } from "next";
import { guardPageAction, guardProjectSlugPage } from "@/lib/page-guards";
import { ProjectInvitationsPage } from "@/module/projects/projects.project.invitations.page";

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
