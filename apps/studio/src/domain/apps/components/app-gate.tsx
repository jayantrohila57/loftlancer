"use client";

import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import type { ReactNode } from "react";
import DashboardSection from "@/components/section-dashboard";
import { LayoutGrid } from "@/lib/icons";
import { routes } from "@/utils/navigation";
import { useOrgSlug } from "@/utils/use-route-scope";
import { useProjectApps } from "../hooks/use-project-apps";

/** Renders an app route only when the app is installed on the project. */
export function AppGate({
  slug,
  appId,
  fallback,
  children,
}: {
  slug: string;
  appId: string;
  fallback: ReactNode;
  children: ReactNode;
}) {
  const org = useOrgSlug();
  const { apps, isLoading, canManage } = useProjectApps(slug);
  if (isLoading) return <>{fallback}</>;
  const app = apps.find((a) => a.id === appId);
  if (app?.status === "active") return <>{children}</>;
  return (
    <DashboardSection
      title={app?.name ?? "App"}
      back={routes.project(org, slug)}
    >
      <EmptyState
        icon={LayoutGrid}
        title={`${app?.name ?? "This app"} isn't installed`}
        description={
          canManage
            ? "Install it from the Apps page to use it in this project."
            : "Ask a project manager to install it on this project."
        }
        actionLabel={canManage ? "Go to Apps" : undefined}
        actionHref={
          canManage ? routes.projectSection(org, slug, "apps") : undefined
        }
      />
    </DashboardSection>
  );
}
