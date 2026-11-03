"use client";

import { EmptyState } from "@features/patterns/core/client/patterns.empty-state";
import Link from "next/link";
import { ErrorState } from "@/components/patterns/error-state";
import { LayoutGrid } from "@/lib/icons";
import { AppGlyph } from "@/module/apps/apps.app.glyph";
import { AppGridSkeleton } from "@/module/apps/apps.grid.skeleton";
import { useProjectApps } from "@/module/apps/apps.use.project.apps";
import { routes } from "@/utils/navigation";
import { useOrgSlug } from "@/utils/use-route-scope";

/** Project overview body: the project's installed apps. */
export function InstalledAppsOverview({ slug }: { slug: string }) {
  const org = useOrgSlug();
  const { installed, isLoading, isError, refetch } = useProjectApps(slug);
  if (isLoading) return <AppGridSkeleton count={1} />;

  if (isError) {
    return (
      <ErrorState
        title="Apps unavailable"
        description="We couldn't load the apps for this project."
        onRetry={() => void refetch()}
      />
    );
  }

  if (installed.length === 0) {
    return (
      <EmptyState
        icon={LayoutGrid}
        title="No apps installed"
        description="Use Apps in the project navigation to browse and install apps."
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
      {installed.map((app) => (
        <Link
          key={app.id}
          href={routes.app(org, slug, app.nav[0]?.path ?? app.id)}
          className="bg-card ring-border/60 hover:bg-muted/30 focus-visible:ring-ring flex min-h-28 flex-col gap-2 rounded-md p-4 ring-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <div className="flex items-center gap-3">
            <AppGlyph icon={app.icon} />
            <h3 className="truncate text-sm font-medium">{app.name}</h3>
          </div>
          <p className="text-muted-foreground line-clamp-2 flex-1 text-xs">
            {app.description}
          </p>
        </Link>
      ))}
    </div>
  );
}
