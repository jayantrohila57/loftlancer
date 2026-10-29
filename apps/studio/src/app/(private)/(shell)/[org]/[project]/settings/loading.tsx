import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import { ProjectSettingsPageSkeleton } from "@/module/projects/projects.project.settings.skeleton";

export default function EditProjectLoading() {
  return <DelayedPageLoading fallback={<ProjectSettingsPageSkeleton />} />;
}
