import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import { ProjectSettingsPageSkeleton } from "@/domain/projects/components/project-settings-skeleton";

export default function EditProjectLoading() {
  return <DelayedPageLoading fallback={<ProjectSettingsPageSkeleton />} />;
}
