import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { loadProjectPageDataOrNotFound } from "@/lib/page-guards";
import { AppGate } from "@/module/apps/apps.app.gate";
import { TasksPage } from "@/module/tasks/tasks.list.content";
import { TasksPageSkeleton } from "@/module/tasks/tasks.list.skeleton";

export const metadata: Metadata = {
  title: "Tasks",
  description: "Track work for this project.",
};

export default async function TasksAppRoute({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const { project: slug } = await params;
  const data = await loadProjectPageDataOrNotFound(slug);
  return (
    <HydrationBoundary state={data.dehydratedState}>
      <AppGate slug={slug} appId="tasks" fallback={<TasksPageSkeleton />}>
        <TasksPage slug={slug} />
      </AppGate>
    </HydrationBoundary>
  );
}
