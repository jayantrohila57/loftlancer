"use client";

import { Button } from "@loftlancer/ui/button";
import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import Link from "next/link";
import { AppIcon } from "@/components/patterns/app-icon";
import { ErrorState } from "@/components/patterns/error-state";
import { LayoutGrid } from "@/lib/icons";
import { routes } from "@/utils/navigation";
import { useOrgSlug } from "@/utils/use-route-scope";
import { useProjectApps } from "../hooks/use-project-apps";
import { AppGlyph } from "./app-glyph";
import { AppGridSkeleton } from "./project-apps-directory";

/** Project overview body: the project's installed apps. */
export function InstalledAppsOverview({
  slug,
  summaries,
}: {
  slug: string;
  summaries?: Record<string, string>;
}) {
  const org = useOrgSlug();
  const { installed, isLoading, isError, canManage } = useProjectApps(slug);
  if (isLoading) return <AppGridSkeleton count={1} />;

  if (isError) {
    return (
      <ErrorState
        title="Apps unavailable"
        description="We couldn't load the apps for this project."
        onRetry={() => window.location.reload()}
      />
    );
  }

  const appsHref = routes.projectSection(org, slug, "apps");
  const addAppCard = canManage ? (
    <Link
      href={appsHref}
      className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/10 p-4 text-center transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <AppIcon name="plus" className="size-4 text-current" />
      </span>
      <span className="font-medium text-sm">Add an app</span>
    </Link>
  ) : null;

  if (installed.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="font-medium text-sm">Apps</h2>
        {canManage ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {addAppCard}
          </div>
        ) : (
          <EmptyState
            icon={LayoutGrid}
            title="No apps installed"
            description="A project manager hasn't installed any apps on this project yet."
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-8 items-center justify-between">
        <h2 className="font-medium text-sm">Apps</h2>
        <Button size="sm" variant="ghost" render={<Link href={appsHref} />}>
          {canManage ? "Manage apps" : "All apps"}
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {installed.map((app) => (
          <Link
            key={app.id}
            href={routes.app(org, slug, app.nav[0]?.path ?? app.id)}
            className="flex min-h-28 flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-border/60 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center gap-3">
              <AppGlyph icon={app.icon} />
              <h3 className="truncate font-medium text-sm">{app.name}</h3>
            </div>
            <p className="line-clamp-2 flex-1 text-muted-foreground text-xs">
              {app.description}
            </p>
            {summaries?.[app.id] ? (
              <p className="text-muted-foreground text-xs tabular-nums">
                {summaries[app.id]}
              </p>
            ) : null}
          </Link>
        ))}
        {addAppCard}
      </div>
    </div>
  );
}
