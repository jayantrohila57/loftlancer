import { DelayedPageLoading } from "@features/patterns/core/client/patterns.delayed-page-loading";
import { ProjectOverviewSectionsSkeleton } from "@/module/projects/projects.project.overview.sections";

export default function ProjectDetailLoading() {
  return <DelayedPageLoading fallback={<ProjectOverviewSectionsSkeleton />} />;
}
