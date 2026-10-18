"use client";

import { Skeleton } from "@loftlancer/ui/skeleton";
import { ErrorState } from "@/components/patterns/error-state";
import DashboardSection from "@/components/section-dashboard";
import { CreateEnvironmentSheet } from "@/domain/environments/components/create-environment-sheet";
import { ProjectEnvironmentsSkeleton } from "@/domain/environments/components/skeletons";
import { useEnvironments } from "@/domain/environments/hooks/use-environments";
import { routes } from "@/utils/navigation";
import { useOrgSlug, useRouteScope } from "@/utils/use-route-scope";
import ProjectDetail from "./project-detail";

interface ProjectEnvironmentsPageProps {
  slug: string;
}

function AddEnvironmentHeaderAction({
  onCreate,
  isPending,
}: {
  onCreate: (name: string) => Promise<void>;
  isPending: boolean;
}) {
  return (
    <CreateEnvironmentSheet
      onConfirm={onCreate}
      isPending={isPending}
      triggerText="Add environment"
      compactOnMobile
    />
  );
}

const ENVIRONMENTS_TITLE = "Environments";
const ENVIRONMENTS_DESCRIPTION = "Variables and secrets per deployment target.";

/**
 * Loading state for the environments page, used by the route `loading.tsx`,
 * the Suspense/app-gate fallbacks and the first client load. Same header as
 * the loaded page (project tabs, back to the project, action slot) and a body
 * that mirrors the env tab rail + variables table (#326).
 */
export function ProjectEnvironmentsLoadingSection({ slug }: { slug?: string }) {
  const { project: routeProject } = useRouteScope();
  const projectSlug = slug ?? routeProject ?? "";
  const org = useOrgSlug();
  return (
    <DashboardSection
      title={ENVIRONMENTS_TITLE}
      description={ENVIRONMENTS_DESCRIPTION}
      back={routes.project(org, projectSlug)}
      action={
        <Skeleton className="size-8 rounded-md sm:h-8 sm:w-auto sm:min-w-[8.5rem]" />
      }
    >
      <ProjectEnvironmentsSkeleton />
    </DashboardSection>
  );
}

export default function ProjectEnvironmentsPage({
  slug,
}: ProjectEnvironmentsPageProps) {
  const {
    project,
    environments,
    status,
    isLoading,
    projectId,
    createEnvironment,
    isCreating,
  } = useEnvironments(slug);
  const org = useOrgSlug();
  const backHref = routes.project(org, slug);

  const showHeaderAction = Boolean(projectId && environments.length > 0);

  const headerAction =
    showHeaderAction && projectId ? (
      <AddEnvironmentHeaderAction
        isPending={isCreating}
        onCreate={async (name) => {
          await createEnvironment({ projectId, name });
        }}
      />
    ) : null;

  if (isLoading && !project) {
    return <ProjectEnvironmentsLoadingSection slug={slug} />;
  }

  if (status === "error" || !project) {
    return (
      <DashboardSection title={ENVIRONMENTS_TITLE} back={backHref}>
        <ErrorState
          title="Project unavailable"
          description="This project could not be loaded. It may have been deleted."
          onRetry={() => window.location.reload()}
        />
      </DashboardSection>
    );
  }

  return (
    <DashboardSection
      title={ENVIRONMENTS_TITLE}
      description={ENVIRONMENTS_DESCRIPTION}
      back={backHref}
      action={headerAction}
    >
      <ProjectDetail projectSlug={slug} project={project} />
    </DashboardSection>
  );
}
