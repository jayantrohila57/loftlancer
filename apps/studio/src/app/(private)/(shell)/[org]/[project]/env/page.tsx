import { routes } from "@features/shell/utils/shell.studio-routes.utils";
import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";

interface ProjectEnvironmentsPageProps {
  params: Promise<{ org: string; project: string }>;
}

export async function generateMetadata({
  params,
}: ProjectEnvironmentsPageProps): Promise<Metadata> {
  const { project } = await params;
  return { title: `${project} · Environments` };
}

export default async function ProjectEnvironmentsRoute({
  params,
}: ProjectEnvironmentsPageProps) {
  const { org, project } = await params;
  redirect(routes.env(org, project) as Route);
}
