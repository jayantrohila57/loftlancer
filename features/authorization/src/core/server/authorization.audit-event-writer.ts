import {
  type ActionName,
  getActionDefinition,
} from "@features/authorization/utils";
import { notifyFromAuditEvent } from "@features/notifications/core/server/notifications.from-audit";
import { db } from "@loftlancer/drizzle";
import { auditEvent } from "@loftlancer/drizzle/schema/audit-event";
import { isNotificationsEnabled } from "@loftlancer/t3-env/notifications";
import { getAuditEventWriterHost } from "./authorization.audit-event-writer-host";

export type AuditEventResult = "success" | "failure" | "denied";

export type WriteAuditEventInput = {
  action: ActionName;
  result: AuditEventResult;
  actorUserId: string;
  organizationId?: string | null;
  projectId?: string | null;
  environmentId?: string | null;
  entityId?: string | null;
  entitySlug?: string | null;
  targetUserId?: string | null;
  denialReason?: string | null;
  errorCode?: string | null;
  payload?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
  durationMs?: number | null;
};

export async function writeAuditEvent(input: WriteAuditEventInput) {
  const def = getActionDefinition(input.action);
  const id = crypto.randomUUID();
  const transport = getAuditEventWriterHost().resolveTransportContext();

  await db.insert(auditEvent).values({
    id,
    action: input.action,
    result: input.result,
    actorUserId: input.actorUserId,
    organizationId: input.organizationId ?? null,
    projectId: input.projectId ?? null,
    environmentId: input.environmentId ?? null,
    entityType: def.audit.entityType,
    entityId: input.entityId ?? null,
    entitySlug: input.entitySlug ?? null,
    targetUserId: input.targetUserId ?? null,
    denialReason: input.denialReason ?? null,
    errorCode: input.errorCode ?? null,
    payload: input.payload ?? {},
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    durationMs: input.durationMs ?? null,
    source: transport.source,
    oauthClientId: transport.oauthClientId,
    mcpTool: transport.mcpTool,
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
