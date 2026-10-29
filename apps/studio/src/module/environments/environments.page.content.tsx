"use client";

import { ErrorState } from "@/components/patterns/error-state";
import DashboardSection from "@/components/section-dashboard";
import { CreateEnvironmentSheet } from "@/module/environments/environments.create.environment.sheet";
import {
  ENVIRONMENTS_DESCRIPTION,
  ENVIRONMENTS_TITLE,
} from "@/module/environments/environments.page.constants";
import { ProjectEnvironmentsLoadingSection } from "@/module/environments/environments.page.skeleton";
import ProjectDetail from "@/module/environments/environments.project.detail";
import { useEnvironments } from "@/module/environments/environments.use.environments";

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
    return <ProjectEnvironmentsLoadingSection />;
  }

  if (status === "error" || !project) {
    return (
      <DashboardSection title={ENVIRONMENTS_TITLE} back={false} hideTabs>
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
      back={false}
      hideTabs
      action={headerAction}
    >
      <ProjectDetail projectSlug={slug} project={project} />
    </DashboardSection>
  );
}
