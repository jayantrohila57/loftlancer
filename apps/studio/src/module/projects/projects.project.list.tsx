"use client";

import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import { ErrorState } from "@/components/patterns/error-state";
import { appIcons } from "@/lib/icons";
import { ProjectsListContent } from "@/module/projects/projects.projects.list.content";
import { ProjectsSkeleton } from "@/module/projects/projects.skeletons";
import { useProjects } from "@/module/projects/projects.use.projects";
import {
  CONTACT_MANAGER_DESCRIPTION,
  CONTACT_MANAGER_TITLE,
} from "@/shared/permissions/shared.permissions.contact.manager";
import { useUnassignedOrgMember } from "@/shared/permissions/shared.permissions.use.permissions";

interface ProjectListProps {
  list?: ReturnType<typeof useProjects>;
}

export default function ProjectList({ list }: ProjectListProps) {
  const internal = useProjects();
  const { projects, status, error, refetch } = list ?? internal;
  const { unassigned, isLoading: unassignedLoading } = useUnassignedOrgMember();

  switch (status) {
    case "loading":
      return <ProjectsSkeleton />;
    case "error":
      return (
        <ErrorState
          title="Failed to load projects"
          safeDescriptionFallback="We could not load your projects. Please try again."
          description={error?.message}
          onRetry={() => void refetch()}
        />
      );
    case "empty":
      if (!unassignedLoading && unassigned) {
        return (
          <EmptyState
            icon={appIcons.project}
            title={CONTACT_MANAGER_TITLE}
            description={CONTACT_MANAGER_DESCRIPTION}
          />
        );
      }
      return (
        <EmptyState
          icon={appIcons.project}
          title="No projects yet"
          description="Create a project to manage environments and variables."
        />
      );
    case "success":
      return <ProjectsListContent projects={projects} />;
  }
}
