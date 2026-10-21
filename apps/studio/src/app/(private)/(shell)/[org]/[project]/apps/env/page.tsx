import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { AppGate } from "@/domain/apps/components/app-gate";
import ProjectEnvironmentsPage, {
  ProjectEnvironmentsLoadingSection,
} from "@/domain/projects/components/project-environments-page";
import { loadProjectPageDataOrNotFound } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Environments",
  description: "Variables and secrets per deployment target.",
};

export default async function EnvironmentsAppRoute({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const { project: slug } = await params;
  const data = await loadProjectPageDataOrNotFound(slug);
  return (
    <HydrationBoundary state={data.dehydratedState}>
      <AppGate
        slug={slug}
        appId="env"
        fallback={<ProjectEnvironmentsLoadingSection />}
      >
        <ProjectEnvironmentsPage slug={slug} />
      </AppGate>
    </HydrationBoundary>
  );
}
