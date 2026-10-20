"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEnvironments } from "@/domain/environments/hooks/use-environments";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { actionToast } from "@/lib/action-toast";
import { trpc } from "@/utils/trpc";

/** Installed + available apps for a project, resolved by slug. */
export function useProjectApps(slug: string) {
  const {
    project,
    projectId,
    isLoading: projectLoading,
    status: projectStatus,
  } = useEnvironments(slug);
  const queryClient = useQueryClient();
  const listOptions = trpc.projectApps.list.queryOptions({
    projectId: projectId ?? "",
  });
  const list = useQuery({ ...listOptions, enabled: Boolean(projectId) });
  const canInstall = useCan("project.app.install", {
    projectId: projectId ?? undefined,
  });

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: listOptions.queryKey }),
      queryClient.invalidateQueries({
        queryKey: trpc.sidebar.navigator.pathKey(),
      }),
    ]);
  };

  const install = useMutation({
    ...trpc.projectApps.install.mutationOptions(),
    onSuccess: invalidate,
  });
  const uninstall = useMutation({
    ...trpc.projectApps.uninstall.mutationOptions(),
    onSuccess: invalidate,
  });

  /** Runs a mutation for the current project; rejects (and toasts) if none is resolved yet. */
  const withProject = <T>(run: (id: string) => Promise<T>): Promise<T> =>
    projectId
      ? run(projectId)
      : Promise.reject(new Error("No project selected"));

  const apps = list.data ?? [];
  return {
    project,
    projectId,
    apps,
    installed: apps.filter((a) => a.status === "active"),
    isLoading: projectLoading || (Boolean(projectId) && list.isPending),
    isError: projectStatus === "error" || list.isError,
    refetch: () => list.refetch(),
    canManage: canInstall.allowed,
    install: (appId: string, name: string) =>
      actionToast(
        withProject((id) => install.mutateAsync({ projectId: id, appId })),
        {
          loading: `Installing ${name}…`,
          success: `${name} installed`,
          error: `Couldn't install ${name}`,
        },
      ),
    uninstall: (appId: string, name: string) =>
      actionToast(
        withProject((id) => uninstall.mutateAsync({ projectId: id, appId })),
        {
          loading: `Uninstalling ${name}…`,
          success: `${name} uninstalled. Data is kept for 30 days.`,
          error: `Couldn't uninstall ${name}`,
        },
      ),
    isMutating: install.isPending || uninstall.isPending,
  };
}

export type ProjectAppItem = ReturnType<typeof useProjectApps>["apps"][number];
