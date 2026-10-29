"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCurrentOrgSlug } from "@/components/org/use-current-org-slug";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { actionToast } from "@/lib/action-toast";
import { useEnvironments } from "@/module/environments/environments.use.environments";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

/** Installed + available apps for a project, resolved by slug. */
export function useProjectApps(slug: string) {
  const {
    project,
    projectId,
    environments,
    createEnvironment,
    isLoading: projectLoading,
    status: projectStatus,
  } = useEnvironments(slug);
  const org = useCurrentOrgSlug() ?? "";
  const router = useRouter();
  const queryClient = useQueryClient();
  const listOptions = trpc.projectApps.list.queryOptions({
    projectId: projectId ?? "",
  });
  const list = useQuery({ ...listOptions, enabled: Boolean(projectId) });
  const canInstall = useCan("project.app.install", {
    projectId: projectId ?? undefined,
  });
  const canCreateEnvironment = useCan("environment.create", {
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
    install: async (appId: string, name: string) => {
      await actionToast(
        withProject((id) => install.mutateAsync({ projectId: id, appId })),
        {
          loading: `Installing ${name}…`,
          success: `${name} installed`,
          error: `Couldn't install ${name}`,
        },
      );

      // A new project has no environment yet. Complete the first-run setup
      // after the user confirms installation, then take them to the variable
      // form instead of leaving them at an empty app page.
      if (
        appId === "env" &&
        environments.length === 0 &&
        projectId &&
        canCreateEnvironment.allowed
      ) {
        const response = await createEnvironment({
          projectId,
          name: "Development",
        });
        const environment = response.data;
        if (environment) {
          window.sessionStorage.setItem(
            "loftlancer:first-run-add-variable",
            "1",
          );
          router.push(
            routes.env(org, slug, environment.slug ?? environment.id),
          );
        }
      }
    },
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
