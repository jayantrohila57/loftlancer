import { routes } from "@features/shell/utils/shell.studio-routes.utils";
import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Tasks",
  description: "Project tasks.",
};

export default async function ProjectTasksRoute({
  params,
}: {
  params: Promise<{ org: string; project: string }>;
}) {
  const { org, project } = await params;
  redirect(routes.tasks(org, project) as Route);
}
