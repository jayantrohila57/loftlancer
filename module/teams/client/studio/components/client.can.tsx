"use client";
import type { ActionName } from "@loftlancer/actions";
import { SettingsPanelSkeleton } from "@loftlancer/ui/patterns/settings-panel-skeleton";
import type { ReactNode } from "react";
import { useCan } from "../hooks/client.use-teams-permission.hook";
export function Can({
  action,
  projectId,
  teamId,
  children,
  fallback,
}: {
  action: ActionName;
  projectId?: string;
  teamId?: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { allowed, isLoading } = useCan(action, { projectId, teamId });
  if (isLoading)
    return fallback === null ? null : <SettingsPanelSkeleton rows={2} />;
  return allowed ? (
    children
  ) : fallback !== undefined ? (
    fallback
  ) : (
    <p className="text-muted-foreground text-sm">
      You do not have permission to view this section.
    </p>
  );
}
