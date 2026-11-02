"use client";

import type { ActionName } from "@loftlancer/actions";
import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import { ErrorState } from "@/components/patterns/error-state";
import { useCan } from "@/shared/permissions/shared.permissions.use.permissions";

type PermissionGateProps = {
  action: ActionName;
  projectId?: string;
  /** Shown when denied (default: compact forbidden message). */
  fallback?: React.ReactNode;
  /** Page-shaped placeholder shown while the client permission check resolves. */
  loadingFallback: React.ReactNode;
  children: React.ReactNode;
};

export function PermissionGate({
  action,
  projectId,
  fallback,
  loadingFallback,
  children,
}: PermissionGateProps) {
  const { allowed, isLoading, reason } = useCan(action, { projectId });

  if (isLoading) {
    return <DelayedPageLoading fallback={loadingFallback} />;
  }

  if (!allowed) {
    if (fallback !== undefined) return <>{fallback}</>;
    return (
      <ErrorState
        title="Not allowed"
        description={
          reason === "denied"
            ? "You do not have permission to view this section."
            : "Permission check failed."
        }
      />
    );
  }

  return <>{children}</>;
}
