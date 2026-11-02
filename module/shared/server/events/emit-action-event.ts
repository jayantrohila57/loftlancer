import type { ActionName } from "@loftlancer/actions";
import type { ServiceResponse } from "../../utils/types/utils.service-response.types";
import type { RunActionContext } from "../run-action";

export type ActionEventPhase = "before" | "after";

export type EmitActionEventInput = {
  action: ActionName;
  phase: ActionEventPhase;
  ctx: RunActionContext;
  serviceResponse?: ServiceResponse<unknown>;
};

/**
 * Observe action lifecycle for analytics/logging. No business rules.
 * Wire PostHog/Sentry in implementation — see docs/gaps/actions-audit.md.
 */
export function emitActionEvent(input: EmitActionEventInput): void {
  void input;
}
