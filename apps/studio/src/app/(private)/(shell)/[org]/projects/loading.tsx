import { DelayedPageLoading } from "@features/patterns/core/client/patterns.delayed-page-loading";
import { ProjectsPageSkeleton } from "@/module/projects/projects.skeletons";

export default function ProjectsLoading() {
  return <DelayedPageLoading fallback={<ProjectsPageSkeleton />} />;
}
