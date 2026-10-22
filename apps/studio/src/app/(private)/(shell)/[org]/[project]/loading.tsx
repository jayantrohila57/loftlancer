import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import { ProjectOverviewSectionsSkeleton } from "@/domain/projects/components/project-overview-sections";

export default function ProjectDetailLoading() {
  return <DelayedPageLoading fallback={<ProjectOverviewSectionsSkeleton />} />;
}
