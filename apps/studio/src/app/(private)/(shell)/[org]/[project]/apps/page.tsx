import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { loadProjectPageDataOrNotFound } from "@/lib/page-guards";
import { AppsDirectoryView } from "@/module/apps/apps.directory.view";

export const metadata: Metadata = {
  title: "Apps",
  description: "Install apps on this project.",
};

export default async function ProjectAppsRoute({
  params,
}: {
  params: Promise<{ org: string; project: string }>;
}) {
  const { project: slug } = await params;
  const data = await loadProjectPageDataOrNotFound(slug);
  return (
    <HydrationBoundary state={data.dehydratedState}>
      <AppsDirectoryView slug={slug} />
    </HydrationBoundary>
  );
}
