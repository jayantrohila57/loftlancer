import {
  type ActionName,
  getActionDefinition,
  isActionsAuditEnabled,
  isAlwaysAuditedAction,
} from "@loftlancer/actions";
import { db } from "@loftlancer/db";
import { auditEvent } from "@loftlancer/db/schema/audit-event";
import { isNotificationsEnabled } from "@loftlancer/notifications";
import { notifyFromAuditEvent } from "@loftlancer/notifications/from-audit";

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

export async function writeAuthAuditEvent(input: WriteAuthAuditEventInput) {
  if (!isActionsAuditEnabled() && !isAlwaysAuditedAction(input.action)) {
    return null;
  }

  const def = getActionDefinition(input.action);
  const id = crypto.randomUUID();

  await db.insert(auditEvent).values({
    id,
    action: input.action,
    result: input.result,
    actorUserId: input.actorUserId,
    organizationId: input.organizationId ?? null,
    projectId: input.projectId ?? null,
    environmentId: null,
    entityType: def.audit.entityType,
    entityId: input.entityId ?? null,
    entitySlug: input.entitySlug ?? null,
    targetUserId: input.targetUserId ?? null,
    denialReason: input.denialReason ?? null,
    errorCode: null,
    payload: input.payload ?? {},
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    durationMs: null,
  });

  if (
    input.result === "success" &&
    def.notifyOn?.length &&
    isNotificationsEnabled()
  ) {
    await notifyFromAuditEvent({
      auditEventId: id,
      action: input.action,
      notifyTypes: def.notifyOn,
      actorUserId: input.actorUserId,
      organizationId: input.organizationId,
      entityId: input.entityId,
      payload: input.payload,
    });
  }

  return id;
}
