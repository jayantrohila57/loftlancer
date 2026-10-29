"use client";

import { useRouter } from "next/navigation";
import { useCurrentOrgSlug } from "@/components/org/use-current-org-slug";
import { useProjects } from "@/module/projects/projects.use.projects";
import { routes } from "@/utils/navigation";

interface UseProjectActionsProps {
  projectId: string;
  onUpdate?: () => void;
}

export function useProjectActions({
  projectId,
  onUpdate,
}: UseProjectActionsProps) {
  const org = useCurrentOrgSlug() ?? "";
  const router = useRouter();

  const {
    archiveProject,
    unarchiveProject,
    changeProjectStatus,
    toggleProjectPublic,
    deleteProject,
    isArchiving,
    isUnarchiving,
    isChangingStatus,
    isTogglingPublic,
    isDeleting,
  } = useProjects();

  const handleArchive = async () => {
    try {
      await archiveProject({ id: projectId });
      onUpdate?.();

      // Redirect to projects list after archiving
      router.push(routes.projects(org));
    } catch (error) {
      console.error("Archive failed:", error);
      throw error;
    }
  };

  const handleUnarchive = async () => {
    try {
      await unarchiveProject({ id: projectId });
      onUpdate?.();

      // Redirect to projects list after unarchiving
      router.push(routes.projects(org));
    } catch (error) {
      console.error("Unarchive failed:", error);
      throw error;
    }
  };

  const handleChangeStatus = async (
    status: "active" | "inactive" | "maintenance",
  ) => {
    try {
      await changeProjectStatus({ id: projectId, status });
      onUpdate?.();

      // Stay on current page, just let the hook handle cache updates
    } catch (error) {
      console.error("Status change failed:", error);
      throw error;
    }
  };

  const handleTogglePublic = async () => {
    try {
      await toggleProjectPublic({ id: projectId });
      onUpdate?.();

      // Stay on current page, just let the hook handle cache updates
    } catch (error) {
      console.error("Toggle public failed:", error);
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject({ id: projectId });
      onUpdate?.();

      // Redirect to projects list after deletion
      router.push(routes.projects(org));
    } catch (error) {
      console.error("Delete failed:", error);
      throw error;
    }
  };

  return {
    archiveProject: handleArchive,
    unarchiveProject: handleUnarchive,
    changeProjectStatus: handleChangeStatus,
    toggleProjectPublic: handleTogglePublic,
    deleteProject: handleDelete,
    isArchiving,
    isUnarchiving,
    isChangingStatus,
    isTogglingPublic,
    isDeleting,
  };
}
