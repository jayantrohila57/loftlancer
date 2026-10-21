"use client";

import type { ActionName } from "@loftlancer/actions";
import { SettingsPanelSkeleton } from "@loftlancer/ui/patterns/settings-panel-skeleton";
import { useCan } from "../hooks/use-permissions";

type CanProps = {
  action: ActionName;
  projectId?: string;
  teamId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export function Can({
  action,
  projectId,
  teamId,
  fallback,
  children,
}: CanProps) {
  const { allowed, isLoading } = useCan(action, { projectId, teamId });
  if (isLoading) {
    if (fallback === null) {
      return null;
    }
    return <SettingsPanelSkeleton rows={2} />;
  }
  if (!allowed) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }
    return (
      <p className="text-muted-foreground text-sm">
        You do not have permission to view this section.
      </p>
    );
  }
  return <>{children}</>;
}
