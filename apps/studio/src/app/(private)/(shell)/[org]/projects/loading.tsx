import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import { ProjectsPageSkeleton } from "@/module/projects/projects.skeletons";

export default function ProjectsLoading() {
  return <DelayedPageLoading fallback={<ProjectsPageSkeleton />} />;
}
