import type { Metadata } from "next";
import { ProjectAccessPage } from "@/domain/projects/components/project-access-page";

export const metadata: Metadata = {
  title: "Project access",
  description:
    "Manage project managers, teams with access, and individual access.",
};

export default async function AccessRoute({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const { project } = await params;
  return <ProjectAccessPage slug={project} />;
}
