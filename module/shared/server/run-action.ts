import type { ActionName } from "@loftlancer/actions";

import type { ServiceOutcome } from "../utils/types/utils.service-outcome.types";
import type { ServiceResponse } from "../utils/types/utils.service-response.types";
import {
  mapOutcomeToResponse,
  serviceResponseUnknownSchema,
} from "../utils/validation/utils.service-response.validation";

/** Request context passed to runAction — extend as ABAC requires. */
export type RunActionContext = {
  userId: string;
  orgId?: string | null;
  projectId?: string | null;
  teamId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

export type RunActionInput<T> = {
  action: ActionName;
  ctx: RunActionContext;
  /** Default true for mutations; set false for read actions per registry. */
  audit?: boolean;
  handler: () => Promise<ServiceOutcome<T>>;
};

/**
 * Permission + handler + audit + ServiceResponse.
 * Wire requireAction + writeAuditEvent from @loftlancer/api — see docs/gaps/actions-audit.md.
 */
export async function runAction<T>(
  input: RunActionInput<T>,
): Promise<ServiceResponse<T>> {
  void input.audit;
  const outcome = await input.handler();
  const response = mapOutcomeToResponse(outcome);
  return serviceResponseUnknownSchema.parse(response) as ServiceResponse<T>;
}

export function buildAccessContext(ctx: RunActionContext): RunActionContext {
  return ctx;
}
