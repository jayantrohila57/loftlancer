import { writeAuditEvent } from "@features/authorization/core/server/authorization.audit-event-writer";
import type { ActionName } from "@features/authorization/utils";
import { isActionsAuditEnabled } from "@features/authorization/utils";

export async function auditSupportSuccess(
  action: ActionName,
  actorUserId: string,
  options: {
    entityId?: string;
    organizationId?: string | null;
    projectId?: string | null;
    targetUserId?: string | null;
    payload?: Record<string, unknown>;
  } = {},
): Promise<void> {
  if (!isActionsAuditEnabled()) {
    return;
  }
  await writeAuditEvent({
    action,
    result: "success",
    actorUserId,
    entityId: options.entityId,
    organizationId: options.organizationId,
    projectId: options.projectId,
    targetUserId: options.targetUserId,
    payload: options.payload,
  });
}
