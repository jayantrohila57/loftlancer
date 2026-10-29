"use client";

import type { EnvironmentOutput, ProjectOutput } from "@loftlancer/api/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrentOrgSlug } from "@/components/org/use-current-org-slug";
import { actionToast } from "@/lib/action-toast";
import { withBasePath } from "@/lib/base-path";
import { captureEvent, STUDIO_EVENTS } from "@/lib/posthog";
import { projectDetailQueryStaleTime } from "@/lib/prefetch-project-detail";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

interface ProjectData {
  project: ProjectOutput | null;
  environments: EnvironmentOutput[];
}

interface ProjectQueryResponse {
  status: "success";
  message: string;
  data: ProjectData;
  error: string | null;
}

function resolveEnvironmentId(
  environments: EnvironmentOutput[],
  param: string | null,
) {
  if (!param) return undefined;
  const byId = environments.find((env) => env.id === param);
  if (byId) return byId.id;
  const bySlug = environments.find((env) => env.slug === param);
  return bySlug?.id;
}

export function useEnvironments(projectSlug: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const org = useCurrentOrgSlug() ?? "";
  // Env is in the path (#299): /[org]/[project]/env/[envSlug].
  const envMatch = /\/env\/([^/?#]+)$/.exec(pathname ?? "");
  const envParam = envMatch?.[1] ? decodeURIComponent(envMatch[1]) : null;

  const projectQuery = useQuery({
    ...trpc.projects.getBySlug.queryOptions({ slug: projectSlug }),
    meta: { toastOnError: false },
    staleTime: projectDetailQueryStaleTime,
    gcTime: projectDetailQueryStaleTime * 2,
  });

  const projectData = projectQuery.data?.data ?? {
    project: null,
    environments: [],
  };
  const environments = projectData.environments;

  const urlActiveTab = useMemo(() => {
    const resolved = resolveEnvironmentId(environments, envParam);
    return resolved ?? environments[0]?.id;
  }, [environments, envParam]);

  const [clientActiveTab, setClientActiveTab] = useState<string | undefined>();

  // biome-ignore lint/correctness/useExhaustiveDependencies: envParam and projectSlug are reset triggers; a URL change drops the optimistic client tab.
  useEffect(() => {
    setClientActiveTab(undefined);
  }, [envParam, projectSlug]);

  const activeTab = clientActiveTab ?? urlActiveTab;

  const setActiveTab = useCallback(
    (id: string) => {
      setClientActiveTab(id);
      const env = environments.find((item) => item.id === id);
      const href = routes.env(org, projectSlug, env?.slug ?? id);
      // Swap tabs without remounting the page. The raw History API does not
      // add the Next basePath (/studio), so prefix it or a reload 404s (#249).
      // Pass `null`, not Next's own history state: Next only syncs its router
      // (usePathname, canonical URL) for foreign state, and with its own state
      // the next router update reverted the URL to /env (#318).
      window.history.replaceState(
        null,
        "",
        `${withBasePath(href)}${window.location.search}`,
      );
    },
    [environments, org, projectSlug],
  );

  const createEnvMutation = useMutation(
    trpc.environments.create.mutationOptions({
      meta: { skipGlobalErrorToast: true },
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
        });

        const previousProjectData = queryClient.getQueryData(
          trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
        ) as ProjectQueryResponse | undefined;

        const optimisticId = crypto.randomUUID();

        if (previousProjectData?.data) {
          const newEnvironment: EnvironmentOutput = {
            id: optimisticId,
            name: variables.name,
            slug: variables.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, ""),
            projectId: previousProjectData.data.project?.id || "",
            createdAt: new Date(),
            updatedAt: new Date(),
            branch: null,
            deployedUrl: null,
            status: "active" as const,
            isProduction: false,
            description: null,
          };

          queryClient.setQueryData(
            trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
            {
              ...previousProjectData,
              data: {
                ...previousProjectData.data,
                environments: [
                  ...previousProjectData.data.environments,
                  newEnvironment,
                ],
              },
            },
          );
        }

        return { previousProjectData, optimisticId };
      },
      onError: () => {
        if (createEnvMutation.context?.previousProjectData) {
          queryClient.setQueryData(
            trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
            createEnvMutation.context.previousProjectData,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.dashboard.getOverview.queryKey(),
        });
      },
      onSuccess: (response) => {
        captureEvent(STUDIO_EVENTS.environmentCreated);
        const newId = response.data?.id;
        if (newId) {
          setActiveTab(newId);
        }
      },
    }),
  );

  const updateEnvMutation = useMutation(
    trpc.environments.update.mutationOptions({
      meta: { skipGlobalErrorToast: true },
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
        });

        const previousProjectData = queryClient.getQueryData(
          trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
        ) as ProjectQueryResponse | undefined;

        if (previousProjectData?.data) {
          queryClient.setQueryData(
            trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
            {
              ...previousProjectData,
              data: {
                ...previousProjectData.data,
                environments: previousProjectData.data.environments.map(
                  (env) =>
                    env.id === variables.id
                      ? {
                          ...env,
                          ...(variables.name && { name: variables.name }),
                          updatedAt: new Date(),
                        }
                      : env,
                ),
              },
            },
          );
        }

        return { previousProjectData };
      },
      onError: () => {
        if (updateEnvMutation.context?.previousProjectData) {
          queryClient.setQueryData(
            trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
            updateEnvMutation.context.previousProjectData,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
      },
    }),
  );

  const deleteEnvMutation = useMutation(
    trpc.environments.delete.mutationOptions({
      meta: { skipGlobalErrorToast: true },
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getBySlug.queryKey({ slug: projectSlug }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.dashboard.getOverview.queryKey(),
        });
        if (activeTab === variables.id) {
          setClientActiveTab(undefined);
          router.replace(routes.env(org, projectSlug), { scroll: false });
        }
      },
    }),
  );

  const isLoading = projectQuery.isLoading && projectData.project === null;
  const status: "loading" | "error" | "success" = isLoading
    ? "loading"
    : projectQuery.isError
      ? "error"
      : "success";

  return {
    project: projectData.project,
    environments,
    status,
    isLoading,
    activeTab,
    setActiveTab,
    createEnvironment: (
      input: Parameters<typeof createEnvMutation.mutateAsync>[0],
    ) =>
      actionToast(createEnvMutation.mutateAsync(input), {
        loading: "Creating environment…",
        success: "Environment created",
      }),
    isCreating: createEnvMutation.isPending,
    updateEnvironment: (
      input: Parameters<typeof updateEnvMutation.mutateAsync>[0],
    ) =>
      actionToast(updateEnvMutation.mutateAsync(input), {
        loading: "Saving environment…",
        success: "Environment updated",
      }),
    isUpdating: updateEnvMutation.isPending,
    deleteEnvironment: (
      input: Parameters<typeof deleteEnvMutation.mutateAsync>[0],
    ) =>
      actionToast(deleteEnvMutation.mutateAsync(input), {
        loading: "Deleting environment…",
        success: "Environment deleted",
      }),
    isDeleting: deleteEnvMutation.isPending,
    projectId: projectData.project?.id,
  };
}
