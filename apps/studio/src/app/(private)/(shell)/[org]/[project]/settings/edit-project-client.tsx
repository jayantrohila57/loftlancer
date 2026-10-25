"use client";

import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/patterns/error-state";
import DashboardSection from "@/components/section-dashboard";
import { EditProject } from "@/domain/projects/components/project-edit";
import { ProjectSettingsSection } from "@/domain/projects/components/project-settings-section";
import { ProjectSettingsPageSkeleton } from "@/domain/projects/components/project-settings-skeleton";
import { trpc } from "@/utils/trpc";

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
    return <ProjectSettingsPageSkeleton />;
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
