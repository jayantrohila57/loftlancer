import { Skeleton } from "@loftlancer/ui/skeleton";
import DashboardSection from "@/components/section-dashboard";
import {
  ENVIRONMENTS_DESCRIPTION,
  ENVIRONMENTS_TITLE,
} from "./environments.page.constants";
import { ProjectEnvironmentsSkeleton } from "./environments.skeletons";

export function ProjectEnvironmentsLoadingSection() {
  return (
    <DashboardSection
      title={ENVIRONMENTS_TITLE}
      description={ENVIRONMENTS_DESCRIPTION}
      back={false}
      hideTabs
      action={
        <Skeleton className="size-8 rounded-md sm:h-8 sm:w-auto sm:min-w-[8.5rem]" />
      }
    >
      <ProjectEnvironmentsSkeleton />
    </DashboardSection>
  );
}
