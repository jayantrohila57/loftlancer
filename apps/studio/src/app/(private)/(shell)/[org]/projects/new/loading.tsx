import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import { Skeleton } from "@loftlancer/ui/skeleton";
import DashboardSection from "@/components/section-dashboard";

export default function NewProjectLoading() {
  return (
    <DelayedPageLoading
      fallback={
        <DashboardSection
          title="Create New Project"
          description="Add a new project to organize your environment variables."
        >
          <div className="space-y-4" role="status" aria-busy="true">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </DashboardSection>
      }
    />
  );
}
