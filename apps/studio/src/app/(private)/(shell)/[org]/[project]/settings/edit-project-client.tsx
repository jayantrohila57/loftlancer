"use client";

import { SettingsPanelSkeleton } from "@loftlancer/ui/patterns/settings-panel-skeleton";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/patterns/error-state";
import DashboardSection from "@/components/section-dashboard";
import { ProjectSettingsSection } from "@/domain/projects/components/project-settings-section";
import { trpc } from "@/utils/trpc";

function ProjectSettingsSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-4" role="status" aria-busy="true">
      <SettingsPanelSkeleton rows={5} />
      <SettingsPanelSkeleton rows={1} />
      <SettingsPanelSkeleton rows={2} />
    </div>
  );
}

const EditProject = dynamic(
  () =>
    import("@/domain/projects/components/project-edit").then(
      (mod) => mod.EditProject,
    ),
  {
    loading: () => <ProjectSettingsSkeleton />,
  },
);

interface EditProjectClientProps {
  slug: string;
}

export default function EditProjectClient({ slug }: EditProjectClientProps) {
  const {
    data: projectBySlug,
    isPending,
    isError,
    refetch,
  } = useQuery({
    ...trpc.projects.getBySlug.queryOptions({ slug }),
    meta: { toastOnError: false },
  });

  const project = projectBySlug?.data?.project;
  if (isPending) {
    return (
      <DashboardSection
        title="Project settings"
        description="Update project information and settings."
        back={false}
        hideTabs
      >
        <ProjectSettingsSkeleton />
      </DashboardSection>
    );
  }

  if (isError) {
    return (
      <DashboardSection
        title="Project settings"
        description="Update project information and settings."
        back={false}
        hideTabs
      >
        <ErrorState
          title="Could not load project settings"
          description="Try loading the project settings again."
          onRetry={() => void refetch()}
        />
      </DashboardSection>
    );
  }

  if (!project) {
    notFound();
  }

  return (
    <DashboardSection
      title="Project settings"
      description="Update project information and settings."
      back={false}
      hideTabs
    >
      <div className="flex flex-col gap-4">
        <EditProject project={project} embedded />
        <ProjectSettingsSection project={project} />
      </div>
    </DashboardSection>
  );
}
