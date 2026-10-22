import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import { ProjectDetailSkeleton } from "@/domain/environments/components/skeletons";

export default function EditProjectLoading() {
  return <DelayedPageLoading fallback={<ProjectDetailSkeleton />} />;
}
