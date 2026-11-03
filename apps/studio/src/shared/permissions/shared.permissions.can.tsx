"use client";

import type { ActionName } from "@features/authorization/utils";
import { SettingsPanelSkeleton } from "@features/patterns/core/client/patterns.settings-panel-skeleton";
import { useCan } from "@/shared/permissions/shared.permissions.use.permissions";

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
