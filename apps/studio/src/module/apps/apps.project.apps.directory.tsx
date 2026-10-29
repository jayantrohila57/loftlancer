"use client";

import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import { ErrorState } from "@/components/patterns/error-state";
import { LayoutGrid } from "@/lib/icons";
import { AppCard } from "@/module/apps/apps.app.card";
import { AppGridSkeleton } from "@/module/apps/apps.grid.skeleton";
import { useProjectApps } from "@/module/apps/apps.use.project.apps";

/** /[org]/[project]/apps — app directory for one project. */
export function ProjectAppsDirectory({ slug }: { slug: string }) {
  const {
    project,
    apps,
    isLoading,
    isError,
    canManage,
    install,
    uninstall,
    isMutating,
    refetch,
  } = useProjectApps(slug);
  const installedApps = apps.filter((app) => app.status === "active");
  const availableApps = apps.filter((app) => app.status === "available");
  const recentlyUninstalledApps = apps.filter(
    (app) => app.status === "uninstalled",
  );
  return (
    <>
      {isLoading ? (
        <AppGridSkeleton />
      ) : isError || !project ? (
        <ErrorState
          title="Apps unavailable"
          description="We couldn't load apps for this project."
          onRetry={() => void refetch()}
        />
      ) : apps.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No apps available"
          description="There are no apps available to add to this project."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {installedApps.length > 0 ? (
            <section
              aria-labelledby="installed-apps-heading"
              className="space-y-3"
            >
              <div>
                <h2 id="installed-apps-heading" className="font-medium text-sm">
                  Installed apps
                </h2>
                <p className="text-muted-foreground text-xs">
                  Apps currently available to this project.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
                {installedApps.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    slug={slug}
                    projectName={project.name}
                    canManage={canManage}
                    busy={isMutating}
                    onInstall={() => install(app.id, app.name)}
                    onUninstall={() => uninstall(app.id, app.name)}
                  />
                ))}
              </div>
            </section>
          ) : null}
          {availableApps.length > 0 ? (
            <section
              aria-labelledby="available-apps-heading"
              className="space-y-3"
            >
              <div>
                <h2 id="available-apps-heading" className="font-medium text-sm">
                  Available apps
                </h2>
                <p className="text-muted-foreground text-xs">
                  Install an app to add its tools to this project.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
                {availableApps.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    slug={slug}
                    projectName={project.name}
                    canManage={canManage}
                    busy={isMutating}
                    onInstall={() => install(app.id, app.name)}
                    onUninstall={() => uninstall(app.id, app.name)}
                  />
                ))}
              </div>
            </section>
          ) : null}
          {recentlyUninstalledApps.length > 0 ? (
            <section
              aria-labelledby="uninstalled-apps-heading"
              className="space-y-3"
            >
              <div>
                <h2
                  id="uninstalled-apps-heading"
                  className="font-medium text-sm"
                >
                  Recently uninstalled
                </h2>
                <p className="text-muted-foreground text-xs">
                  Reinstall before the retention period ends to restore saved
                  data.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
                {recentlyUninstalledApps.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    slug={slug}
                    projectName={project.name}
                    canManage={canManage}
                    busy={isMutating}
                    onInstall={() => install(app.id, app.name)}
                    onUninstall={() => uninstall(app.id, app.name)}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </>
  );
}
