"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/patterns/error-state";
import DashboardSection from "@/components/section-dashboard";
import { ProjectDetailSkeleton } from "@/domain/environments/components/skeletons";
import { ProjectDetailStats } from "@/domain/projects/components/project-detail-stats";
import { ProjectSettingsSection } from "@/domain/projects/components/project-settings-section";
import { trpc } from "@/utils/trpc";

const EditProject = dynamic(
  () =>
    import("@/domain/projects/components/project-edit").then(
      (mod) => mod.EditProject,
    ),
  {
    loading: () => <ProjectDetailSkeleton />,
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
        stats={<ProjectDetailStats slug={slug} />}
      >
        <ProjectDetailSkeleton />
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
      stats={<ProjectDetailStats slug={slug} />}
    >
      <div className="flex flex-col gap-4">
        <EditProject project={project} embedded />
        <ProjectSettingsSection project={project} />
      </div>
    </DashboardSection>
  );
}
