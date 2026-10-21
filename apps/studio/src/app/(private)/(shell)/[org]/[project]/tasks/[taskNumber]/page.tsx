import { routes } from "@loftlancer/ui/studio-routes";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Tasks",
  description: "Project tasks.",
};

export default async function ProjectTaskRoute({
  params,
}: {
  params: Promise<{ org: string; project: string; taskNumber: string }>;
}) {
  const { org, project, taskNumber } = await params;
  if (!/^[1-9]\d*$/.test(taskNumber)) notFound();
  redirect(routes.task(org, project, taskNumber));
}
