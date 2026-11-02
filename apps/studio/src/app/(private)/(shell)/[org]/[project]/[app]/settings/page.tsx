import { getAppManifest } from "@loftlancer/actions";
import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadProjectPageDataOrNotFound } from "@/lib/page-guards";
import { AppSettingsPage } from "@/module/apps/apps.app.settings.page";

export const metadata: Metadata = {
  title: "App settings",
  description: "Configure a project app.",
};

export default async function ProjectAppSettingsRoute({
  params,
}: {
  params: Promise<{ org: string; project: string; app: string }>;
}) {
  const { project: slug, app } = await params;
  // Unregistered app ids are unknown routes (#309); the org layout preflight
  // already 404s them on a full load, this covers client navigations.
  if (!getAppManifest(app)) notFound();
  const data = await loadProjectPageDataOrNotFound(slug);
  return (
    <HydrationBoundary state={data.dehydratedState}>
      <AppSettingsPage slug={slug} appId={app} />
    </HydrationBoundary>
  );
}
