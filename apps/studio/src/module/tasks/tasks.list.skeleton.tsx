import { Skeleton } from "@loftlancer/ui/skeleton";
import DashboardSection from "@/components/section-dashboard";

export function TasksPageSkeleton() {
  return (
    <DashboardSection
      title="Tasks"
      description="Track work for this project."
      hideTabs
    >
      <div className="flex flex-col gap-3" role="status" aria-busy="true">
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </DashboardSection>
  );
}
