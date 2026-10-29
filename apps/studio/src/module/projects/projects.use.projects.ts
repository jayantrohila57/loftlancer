"use client";

import type { ProjectOutput } from "@loftlancer/api/types";
import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { useOrgQueryEnabled } from "@/hooks/use-org-query-enabled";
import { actionToast } from "@/lib/action-toast";
import { captureEvent, STUDIO_EVENTS } from "@/lib/posthog";
import { trpc } from "@/utils/trpc";

type ApiProject = ProjectOutput;

interface ProjectsQueryResponse {
  status: "success";
  message: string;
  data: ApiProject[];
  error: string | null;
}

interface ProjectBySlugResponse {
  status: "success";
  message: string;
  data: {
    project: ApiProject | null;
    environments: unknown[];
  };
  error: string | null;
}

function patchProjectInGetBySlugCaches(
  queryClient: QueryClient,
  projectId: string,
  patch: Partial<ApiProject>,
) {
  const queries = queryClient.getQueryCache().findAll({
    predicate: (query) => JSON.stringify(query.queryKey).includes("getBySlug"),
  });

  for (const query of queries) {
    queryClient.setQueryData(query.queryKey, (old: unknown) => {
      const typed = old as ProjectBySlugResponse | undefined;
      if (!typed?.data?.project || typed.data.project.id !== projectId) {
        return old;
      }
      return {
        ...typed,
        data: {
          ...typed.data,
          project: { ...typed.data.project, ...patch },
        },
      };
    });
  }
}

function invalidateGetBySlugQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({
    predicate: (query) => JSON.stringify(query.queryKey).includes("getBySlug"),
  });
}

// Helper function to transform API response to proper ProjectOutput type
function transformProject(project: ApiProject): ProjectOutput {
  return {
    ...project,
    status: project.status as "active" | "inactive" | "maintenance",
  };
}

const PROJECTS_LOAD_TIMEOUT_MS = 20_000;

export function useProjects() {
  const queryClient = useQueryClient();
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const { isSwitching } = useActiveOrganization();
  const queryEnabled = useOrgQueryEnabled();

  const projectsQuery = useQuery({
    ...trpc.projects.list.queryOptions(),
    meta: { toastOnError: false },
    retry: (failureCount, err) => {
      const code = (err as { data?: { code?: string } })?.data?.code;
      if (code === "FORBIDDEN" && failureCount < 4) return true;
      return failureCount < 2;
    },
    retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 4000),
    refetchOnWindowFocus: true,
    enabled: queryEnabled && !isSwitching,
  });

  useEffect(() => {
    if (!projectsQuery.isLoading) {
      setLoadTimedOut(false);
      return;
    }
    const timer = window.setTimeout(
      () => setLoadTimedOut(true),
      PROJECTS_LOAD_TIMEOUT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [projectsQuery.isLoading]);

  const createMutation = useMutation(
    trpc.projects.create.mutationOptions({
      meta: { skipGlobalErrorToast: true },
      onSuccess: (data) => {
        captureEvent(STUDIO_EVENTS.projectCreated, { source: "projects" });
        queryClient.setQueryData(
          trpc.projects.list.queryKey(),
          (old: ProjectsQueryResponse | undefined) => {
            if (!old) return old;
            return {
              ...old,
              data: [...old.data, transformProject(data.data)],
            };
          },
        );
      },
      onError: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.projects.update.mutationOptions({
      meta: { skipGlobalErrorToast: true },
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: trpc.projects.list.queryKey(),
        });

        // Snapshot the previous value
        const previousProjects = queryClient.getQueryData(
          trpc.projects.list.queryKey(),
        ) as ProjectsQueryResponse | undefined;

        // Optimistically update to the new value
        queryClient.setQueryData(
          trpc.projects.list.queryKey(),
          (old: ProjectsQueryResponse | undefined) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.map((project) =>
                project.id === variables.id
                  ? { ...project, ...variables }
                  : project,
              ),
            };
          },
        );

        return { previousProjects };
      },
      onError: () => {
        // Rollback to the previous value
        if (updateMutation.context?.previousProjects) {
          queryClient.setQueryData(
            trpc.projects.list.queryKey(),
            updateMutation.context.previousProjects,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === "projects" &&
            Array.isArray(query.queryKey[1]) &&
            query.queryKey[1][0] === "getBySlug",
        });
        queryClient.invalidateQueries({
          queryKey: trpc.dashboard.getOverview.queryKey(),
        });
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.projects.delete.mutationOptions({
      meta: { skipGlobalErrorToast: true },
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: trpc.projects.list.queryKey(),
        });

        // Snapshot the previous value
        const previousProjects = queryClient.getQueryData(
          trpc.projects.list.queryKey(),
        ) as ProjectsQueryResponse | undefined;

        // Optimistically remove the deleted project
        queryClient.setQueryData(
          trpc.projects.list.queryKey(),
          (old: ProjectsQueryResponse | undefined) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.filter((project) => project.id !== variables.id),
            };
          },
        );

        return { previousProjects };
      },
      onError: () => {
        // Rollback to the previous value
        if (deleteMutation.context?.previousProjects) {
          queryClient.setQueryData(
            trpc.projects.list.queryKey(),
            deleteMutation.context.previousProjects,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.dashboard.getOverview.queryKey(),
        });
      },
    }),
  );

  const archiveMutation = useMutation(
    trpc.projects.archive.mutationOptions({
      meta: { skipGlobalErrorToast: true },
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.projects.list.queryKey(),
        });

        const previousProjects = queryClient.getQueryData(
          trpc.projects.list.queryKey(),
        ) as ProjectsQueryResponse | undefined;

        queryClient.setQueryData(
          trpc.projects.list.queryKey(),
          (old: ProjectsQueryResponse | undefined) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: old.data.map((project: ApiProject) =>
                project.id === variables.id
                  ? { ...project, isArchived: true }
                  : project,
              ),
            };
          },
        );

        return { previousProjects };
      },
      onError: () => {
        if (archiveMutation.context?.previousProjects) {
          queryClient.setQueryData(
            trpc.projects.list.queryKey(),
            archiveMutation.context.previousProjects,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
      },
    }),
  );

  const unarchiveMutation = useMutation(
    trpc.projects.unarchive.mutationOptions({
      meta: { skipGlobalErrorToast: true },
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.projects.list.queryKey(),
        });

        const previousProjects = queryClient.getQueryData(
          trpc.projects.list.queryKey(),
        ) as ProjectsQueryResponse | undefined;

        queryClient.setQueryData(
          trpc.projects.list.queryKey(),
          (old: ProjectsQueryResponse | undefined) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: old.data.map((project: ApiProject) =>
                project.id === variables.id
                  ? { ...project, isArchived: false }
                  : project,
              ),
            };
          },
        );

        return { previousProjects };
      },
      onError: () => {
        if (unarchiveMutation.context?.previousProjects) {
          queryClient.setQueryData(
            trpc.projects.list.queryKey(),
            unarchiveMutation.context.previousProjects,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
      },
    }),
  );

  const changeStatusMutation = useMutation(
    trpc.projects.changeStatus.mutationOptions({
      meta: { skipGlobalErrorToast: true },
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.projects.list.queryKey(),
        });

        const previousProjects = queryClient.getQueryData(
          trpc.projects.list.queryKey(),
        ) as ProjectsQueryResponse | undefined;

        queryClient.setQueryData(
          trpc.projects.list.queryKey(),
          (old: ProjectsQueryResponse | undefined) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: old.data.map((project: ApiProject) =>
                project.id === variables.id
                  ? { ...project, status: variables.status }
                  : project,
              ),
            };
          },
        );

        patchProjectInGetBySlugCaches(queryClient, variables.id, {
          status: variables.status,
        });

        return { previousProjects };
      },
      onError: () => {
        if (changeStatusMutation.context?.previousProjects) {
          queryClient.setQueryData(
            trpc.projects.list.queryKey(),
            changeStatusMutation.context.previousProjects,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
        invalidateGetBySlugQueries(queryClient);
      },
    }),
  );

  const togglePublicMutation = useMutation(
    trpc.projects.togglePublic.mutationOptions({
      meta: { skipGlobalErrorToast: true },
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.projects.list.queryKey(),
        });

        const previousProjects = queryClient.getQueryData(
          trpc.projects.list.queryKey(),
        ) as ProjectsQueryResponse | undefined;

        // Optimistically update the public status
        const nextIsPublic = previousProjects?.data?.find(
          (p) => p.id === variables.id,
        )?.isPublic;

        queryClient.setQueryData(
          trpc.projects.list.queryKey(),
          (old: ProjectsQueryResponse | undefined) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: old.data.map((project: ApiProject) =>
                project.id === variables.id
                  ? { ...project, isPublic: !project.isPublic }
                  : project,
              ),
            };
          },
        );

        if (nextIsPublic !== undefined) {
          patchProjectInGetBySlugCaches(queryClient, variables.id, {
            isPublic: !nextIsPublic,
          });
        }

        return { previousProjects };
      },
      onError: () => {
        if (togglePublicMutation.context?.previousProjects) {
          queryClient.setQueryData(
            trpc.projects.list.queryKey(),
            togglePublicMutation.context.previousProjects,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
        invalidateGetBySlugQueries(queryClient);
      },
    }),
  );

  const hasCachedList = projectsQuery.data !== undefined;

  const status: "loading" | "error" | "empty" | "success" =
    isSwitching || (!queryEnabled && !hasCachedList)
      ? "loading"
      : loadTimedOut
        ? "error"
        : projectsQuery.isLoading
          ? "loading"
          : projectsQuery.isError
            ? "error"
            : projectsQuery.data?.data.length === 0
              ? "empty"
              : "success";

  return {
    projects: isSwitching
      ? []
      : (projectsQuery.data?.data ?? []).map(transformProject),
    status,
    error: loadTimedOut
      ? new Error("Projects took too long to load. Please try again.")
      : projectsQuery.error,
    refetch: projectsQuery.refetch,
    createProject: (input: Parameters<typeof createMutation.mutateAsync>[0]) =>
      actionToast(createMutation.mutateAsync(input), {
        loading: "Creating project…",
        success: "Project created successfully",
      }),
    isCreating: createMutation.isPending,
    updateProject: (input: Parameters<typeof updateMutation.mutateAsync>[0]) =>
      actionToast(updateMutation.mutateAsync(input), {
        loading: "Saving project…",
        success: "Project updated successfully",
      }),
    isUpdating: updateMutation.isPending,
    deleteProject: (input: Parameters<typeof deleteMutation.mutateAsync>[0]) =>
      actionToast(deleteMutation.mutateAsync(input), {
        loading: "Deleting project…",
        success: "Project deleted successfully",
      }),
    isDeleting: deleteMutation.isPending,
    archiveProject: (
      input: Parameters<typeof archiveMutation.mutateAsync>[0],
    ) =>
      actionToast(archiveMutation.mutateAsync(input), {
        loading: "Archiving project…",
        success: "Project archived successfully",
      }),
    isArchiving: archiveMutation.isPending,
    unarchiveProject: (
      input: Parameters<typeof unarchiveMutation.mutateAsync>[0],
    ) =>
      actionToast(unarchiveMutation.mutateAsync(input), {
        loading: "Unarchiving project…",
        success: "Project unarchived successfully",
      }),
    isUnarchiving: unarchiveMutation.isPending,
    changeProjectStatus: (
      input: Parameters<typeof changeStatusMutation.mutateAsync>[0],
    ) =>
      actionToast(changeStatusMutation.mutateAsync(input), {
        loading: "Updating status…",
        success: "Project status updated",
      }),
    isChangingStatus: changeStatusMutation.isPending,
    toggleProjectPublic: (
      input: Parameters<typeof togglePublicMutation.mutateAsync>[0],
    ) =>
      actionToast(togglePublicMutation.mutateAsync(input), {
        loading: "Updating visibility…",
        success: "Project visibility updated",
      }),
    isTogglingPublic: togglePublicMutation.isPending,
  };
}
