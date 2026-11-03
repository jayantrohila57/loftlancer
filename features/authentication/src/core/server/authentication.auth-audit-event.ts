import {
  getActionDefinition,
  isActionsAuditEnabled,
  isAlwaysAuditedAction,
} from "@features/authorization/utils";
import { notifyFromAuditEvent } from "@features/notifications/core/server/notifications.from-audit";
import { db } from "@loftlancer/drizzle";
import { auditEvent } from "@loftlancer/drizzle/schema/audit-event";
import { isNotificationsEnabled } from "@loftlancer/t3-env/notifications";

import type {
  AuthAuditResult,
  WriteAuthAuditEventInput,
} from "../../types/authentication.auth-audit.types";

export type { AuthAuditResult, WriteAuthAuditEventInput };

/** Auth-lifecycle audit writer (session/org hooks) — gates on actions audit flags. */
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
