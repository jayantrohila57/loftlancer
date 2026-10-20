"use client";

import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { ErrorState } from "@/components/patterns/error-state";
import DashboardSection from "@/components/section-dashboard";
import { LayoutGrid } from "@/lib/icons";
import { useProjectApps } from "../hooks/use-project-apps";
import { AppCard } from "./app-card";

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"];

export function AppGridSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-busy="true"
    >
      {SKELETON_KEYS.slice(0, count).map((k) => (
        <Skeleton key={k} className="min-h-36 rounded-xl" />
      ))}
    </div>
  );
}

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
  return (
    <DashboardSection
      title="Apps"
      description="Install apps to add features to this project. Apps are per project."
      back={false}
      hideTabs
    >
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
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
      )}
    </DashboardSection>
  );
}
