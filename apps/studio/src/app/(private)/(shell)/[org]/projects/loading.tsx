import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import { ProjectsPageSkeleton } from "@/domain/projects/components/skeletons";

export default function ProjectsLoading() {
  return <DelayedPageLoading fallback={<ProjectsPageSkeleton />} />;
}
