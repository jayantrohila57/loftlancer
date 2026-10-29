import type { Metadata } from "next";
import { ProjectAccessView } from "@/module/projects/projects.access.view";

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
  return <ProjectAccessView slug={project} />;
}
