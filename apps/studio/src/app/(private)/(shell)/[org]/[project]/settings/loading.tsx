import { DelayedPageLoading } from "@features/patterns/core/client/patterns.delayed-page-loading";
import { ProjectSettingsPageSkeleton } from "@/module/projects/projects.project.settings.skeleton";

export default function EditProjectLoading() {
  return <DelayedPageLoading fallback={<ProjectSettingsPageSkeleton />} />;
}
