import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import { ProjectEnvironmentsLoadingSection } from "@/module/environments/environments.page.skeleton";

export default function ProjectEnvironmentsLoading() {
  return (
    <DelayedPageLoading fallback={<ProjectEnvironmentsLoadingSection />} />
  );
}
