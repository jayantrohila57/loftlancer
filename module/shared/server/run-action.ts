import type { ActionName } from "@loftlancer/actions";
import { writeAuditEvent } from "@loftlancer/api/actions/audit-event-writer";
import {
  isReadAction,
  requireAction,
} from "@loftlancer/api/actions/require-action";
import { logger } from "@loftlancer/logger";
import type { ServiceOutcome } from "../utils/types/utils.service-outcome.types";
import type { ServiceResponse } from "../utils/types/utils.service-response.types";
import {
  createError,
  createFailed,
  mapOutcomeToResponse,
  serviceResponseUnknownSchema,
} from "../utils/validation/utils.service-response.validation";

export type RunActionContext = {
  userId: string;
  orgId?: string | null;
  projectId?: string | null;
  teamId?: string | null;
  targetUserId?: string | null;
  entityId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  payload?: Record<string, unknown>;
};
export type RunActionInput<T> = {
  action: ActionName;
  ctx: RunActionContext;
  audit?: boolean;
  handler: () => Promise<ServiceOutcome<T>>;
  validate?: (response: ServiceResponse<T>) => ServiceResponse<T>;
};
export function buildAccessContext(ctx: RunActionContext) {
  return {
    userId: ctx.userId,
    organizationId: ctx.orgId,
    projectId: ctx.projectId,
    teamId: ctx.teamId,
    targetUserId: ctx.targetUserId,
    entityId: ctx.entityId,
    ipAddress: ctx.ip,
    userAgent: ctx.userAgent,
    audit: false as const,
  };
}
/** Permission checks never audit prematurely: record the final handler outcome once. */
export async function runAction<T>(
  input: RunActionInput<T>,
): Promise<ServiceResponse<T>> {
  const started = Date.now();
  let result: "success" | "failure" | "denied" = "failure";
  let response: ServiceResponse<T>;
  let authorized = false;
  try {
    await requireAction(input.action, buildAccessContext(input.ctx));
    authorized = true;
    response = mapOutcomeToResponse(await input.handler());
    response = serviceResponseUnknownSchema.parse(
      response,
    ) as ServiceResponse<T>;
    if (input.validate) response = input.validate(response);
    result = response.status === "success" ? "success" : "failure";
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? error.code
        : undefined;
    if (
      !authorized &&
      (code === "FORBIDDEN" || code === "NOT_FOUND" || code === "UNAUTHORIZED")
    ) {
      result = "denied";
      response = createFailed(
        error instanceof Error ? error.message : "Not allowed",
      );
    } else {
      logger.exception("Action failed", error, { action: input.action });
      response = createError("Something went wrong. Please try again.", {
        code: "ACTION_FAILED",
      });
    }
  }
  if (input.audit !== false && !isReadAction(input.action)) {
    const data = response.data;
    const entityId =
      input.ctx.entityId ??
      input.ctx.teamId ??
      (data &&
      !Array.isArray(data) &&
      typeof data === "object" &&
      "id" in data &&
      typeof data.id === "string"
        ? data.id
        : null);
    try {
      await writeAuditEvent({
        action: input.action,
        result,
        actorUserId: input.ctx.userId,
        organizationId: input.ctx.orgId,
        projectId: input.ctx.projectId,
        entityId,
        targetUserId: input.ctx.targetUserId,
        ipAddress: input.ctx.ip,
        userAgent: input.ctx.userAgent,
        durationMs: Date.now() - started,
        payload: input.ctx.payload,
        ...(result === "denied" ? { denialReason: response.message } : {}),
      });
    } catch (error) {
      logger.exception("Action audit failed", error, { action: input.action });
    }
  }
  return serviceResponseUnknownSchema.parse(response) as ServiceResponse<T>;
}
