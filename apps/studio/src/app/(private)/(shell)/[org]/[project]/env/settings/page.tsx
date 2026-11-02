import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { loadProjectPageDataOrNotFound } from "@/lib/page-guards";
import { AppSettingsPage } from "@/module/apps/apps.app.settings.page";

export const metadata: Metadata = {
  title: "Environments settings",
  description: "Configure the Environments app for this project.",
};

/** Static `env/` shadows `[app]/settings`, so the app's settings live here. */
export default async function EnvironmentsAppSettingsRoute({
  params,
}: {
  params: Promise<{ org: string; project: string }>;
}) {
  const { project: slug } = await params;
  const data = await loadProjectPageDataOrNotFound(slug);
  return (
    <HydrationBoundary state={data.dehydratedState}>
      <AppSettingsPage slug={slug} appId="env" />
    </HydrationBoundary>
  );
}
