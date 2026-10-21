import { routes } from "@loftlancer/ui/studio-routes";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

interface ProjectEnvironmentsPageProps {
  params: Promise<{ org: string; project: string; envSlug: string }>;
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
  const { org, project, envSlug } = await params;
  redirect(routes.env(org, project, envSlug));
}
