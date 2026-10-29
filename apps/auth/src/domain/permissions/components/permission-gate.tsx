"use client";

import type { ActionName } from "@loftlancer/actions";
import { Spinner } from "@loftlancer/ui/spinner";
import { ErrorState } from "@/shared/components/shared.error-state";
import { useCan } from "../hooks/use-permissions";

type PermissionGateProps = {
  action: ActionName;
  projectId?: string;
  /** Shown when denied (default: compact forbidden message). */
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export function PermissionGate({
  action,
  projectId,
  fallback,
  children,
}: PermissionGateProps) {
  const { allowed, isLoading, reason } = useCan(action, { projectId });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
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
