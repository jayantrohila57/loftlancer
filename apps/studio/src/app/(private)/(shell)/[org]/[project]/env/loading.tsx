import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import { ProjectEnvironmentsLoadingSection } from "@/domain/projects/components/project-environments-page";

export default function ProjectEnvironmentsLoading() {
  return (
    <DelayedPageLoading fallback={<ProjectEnvironmentsLoadingSection />} />
  );
}
