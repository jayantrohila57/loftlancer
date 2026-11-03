import type { ActionName } from "@features/authorization/utils";

export type AuthAuditResult = "success" | "failure" | "denied";

export type WriteAuthAuditEventInput = {
  action: ActionName;
  result: AuthAuditResult;
  actorUserId: string;
  organizationId?: string | null;
  projectId?: string | null;
  entityId?: string | null;
  entitySlug?: string | null;
  targetUserId?: string | null;
  denialReason?: string | null;
  payload?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};
