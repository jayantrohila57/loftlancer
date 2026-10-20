"use client";

import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import type { ReactNode } from "react";
import { ErrorState } from "@/components/patterns/error-state";
import DashboardSection from "@/components/section-dashboard";
import { LayoutGrid } from "@/lib/icons";
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
  const { apps, isLoading, isError, canManage, refetch } = useProjectApps(slug);
  if (isLoading) return <>{fallback}</>;
  if (isError) {
    return (
      <DashboardSection title="App unavailable" back={false} hideTabs>
        <ErrorState
          title="Couldn't check this app"
          description="We couldn't load the apps for this project."
          onRetry={() => void refetch()}
        />
      </DashboardSection>
    );
  }
  const app = apps.find((a) => a.id === appId);
  if (app?.status === "active") return <>{children}</>;
  return (
    <DashboardSection title={app?.name ?? "App"} back={false} hideTabs>
      <EmptyState
        icon={LayoutGrid}
        title={`${app?.name ?? "This app"} isn't installed`}
        description={
          canManage
            ? "Use Apps in the project navigation to install it for this project."
            : "Ask a project manager to install it on this project."
        }
      />
    </DashboardSection>
  );
}
